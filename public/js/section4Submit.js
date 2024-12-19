console.log('[DEBUG] Section 4 script initializing');

class Section4Handler {
    constructor() {
        this.init();
        this.attachEventListeners();
    }

    init() {
        console.log('[DEBUG] Section 4 initialized');
        console.log('- Firebase available:', typeof firebase !== 'undefined');
        console.log('- LongForm available:', !!window.longFormCapture);
    }

    async runTests() {
        const results = {
            firebase: false,
            longForm: false,
            signature: false,
            validation: false
        };

        try {
            // בדיקת Firebase
            results.firebase = !!(window.db && window.storage);
            console.log('[TEST] Firebase connection:', results.firebase);

            // בדיקת LongForm
            results.longForm = !!window.longFormCapture;
            if (results.longForm) {
                try {
                    await window.longFormCapture.testConnection();
                    console.log('[TEST] LongForm connection test passed');
                } catch (error) {
                    console.error('[TEST] LongForm test failed:', error);
                }
            }

            // בדיקת חתימה
            results.signature = !!window.signaturePad && !window.signaturePad.isEmpty();
            console.log('[TEST] Signature pad:', results.signature);

            // בדיקת וולידציה
            const form = document.getElementById('section4-form');
            results.validation = !!form;
            
            this.showTestResults(results);
            return results;

        } catch (error) {
            console.error('[TEST] Tests failed:', error);
            this.showTestResults({ error: error.message });
            return false;
        }
    }

    showTestResults(results) {
        const resultsDiv = document.createElement('div');
        resultsDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            direction: rtl;
        `;

        let html = '<h3>תוצאות בדיקת מערכת:</h3><ul style="list-style: none; padding: 0;">';
        for (const [test, result] of Object.entries(results)) {
            const icon = result ? '✅' : '❌';
            html += `<li>${test}: ${icon}</li>`;
        }
        html += '</ul>';
        
        if (Object.values(results).every(r => r)) {
            html += '<div style="color: green; font-weight: bold;">כל הבדיקות עברו בהצלחה!</div>';
        } else {
            html += '<div style="color: red; font-weight: bold;">יש בעיות שצריך לתקן</div>';
        }

        resultsDiv.innerHTML = html;
        document.body.appendChild(resultsDiv);
        setTimeout(() => resultsDiv.remove(), 5000);
    }

    validateForm() {
        const form = document.getElementById('section4-form');
        const submitButton = document.getElementById('finalSubmit');
        
        const checkboxes = [
            'riskAcknowledgement',
            'independentDecision',
            'updateCommitment',
            'finalConfirmation'
        ];

        const allChecked = checkboxes.every(name => {
            const checkbox = form.querySelector(`input[name="${name}"]`);
            return checkbox && checkbox.checked;
        });

        const signaturePad = window.signaturePad;
        const hasSignature = signaturePad && !signaturePad.isEmpty();
        
        console.log('[Form] Validation state:', { allChecked, hasSignature });
        
        submitButton.disabled = !(allChecked && hasSignature);
        return allChecked && hasSignature;
    }

    async submitForm(e) {
        e.preventDefault();
        console.log("[DEBUG] Starting final submission");

        const submitButton = document.getElementById('finalSubmit');
        const buttonText = submitButton.querySelector('.button-text');
        const buttonLoader = submitButton.querySelector('.button-loader');

        try {
            if (!this.validateForm()) {
                showMessage("נא למלא את כל השדות הנדרשים וכן להוסיף חתימה");
                return;
            }

            submitButton.disabled = true;
            buttonText.style.opacity = '0';
            buttonLoader.style.display = 'block';

            // שמירת נתוני הטופס הנוכחי
            const formData = new FormData(document.querySelector('form'));
            localStorage.setItem('section4Data', JSON.stringify(Object.fromEntries(formData.entries())));

            // יצירת PDF מלא
            console.log("[DEBUG] Creating full PDF");
            const { url: pdfUrl, size } = await window.longFormCapture.captureFullForm();
            console.log("[DEBUG] PDF created, size:", size);

            // שמירה בפיירסטור
            const docRef = await window.db.collection('completed_forms').add({
                ...Object.fromEntries(formData.entries()),
                pdfUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log("[DEBUG] Form saved to Firestore:", docRef.id);
            showMessage("הטופס נשלח בהצלחה!", "success");
            
            setTimeout(() => {
                localStorage.clear();
                window.location.href = "/sections/thank-you.html";
            }, 2000);

        } catch (error) {
            console.error("[ERROR] Submit failed:", error);
            showMessage(error.message || "שגיאה בשליחת הטופס");
        } finally {
            submitButton.disabled = false;
            buttonText.style.opacity = '1';
            buttonLoader.style.display = 'none';
        }
    }

    attachEventListeners() {
        const form = document.getElementById('section4-form');
        
        // הוספת כפתור בדיקה
        const testButton = document.createElement('button');
        testButton.textContent = 'בדיקת מערכת';
        testButton.className = 'btn-secondary';
        testButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(testButton);

        if (form) {
            form.addEventListener('submit', (e) => this.submitForm(e));
            form.addEventListener('change', () => this.validateForm());
            testButton.addEventListener('click', () => this.runTests());
            console.log('[DEBUG] Event listeners attached');
        }
    }
}

// יצירת instance ושמירה גלובלית
window.section4Handler = new Section4Handler();