class FormHandler {
    constructor() {
        // מניעת יצירת מופע כפול
        if (window.formHandler) {
            console.log('[DEBUG] Form handler already exists');
            return window.formHandler;
        }
        
        console.log('[DEBUG] Initializing new FormHandler');
        window.formHandler = this;

        // אתחול משתני המחלקה
        this.currentSection = 0;
        this.formData = {};
        this.sections = document.querySelectorAll('.form-section');
        this.hasChanges = false;

        // בדיקה שיש סקשנים
        if (this.sections.length === 0) {
            console.error('[ERROR] No form sections found');
            return;
        }

        this.initializeSections();
        this.initializeEventListeners();
        this.initializeSignaturePad();
        this.loadSavedData();
        
        // הפעלת הדיבאג פאנל
        this.initializeDebugPanel();

        return this;
    }

    initializeSections() {
        console.log('[DEBUG] Initializing sections');
        
        // הסתרת כל הסקשנים
        this.sections.forEach((section, index) => {
            section.style.display = 'none';
            section.classList.remove('active');
            console.log(`[DEBUG] Section ${index + 1} initialized`);
        });

        // הצגת הסקשן הראשון
        if (this.sections[0]) {
            this.sections[0].style.display = 'block';
            this.sections[0].classList.add('active');
            this.updateProgressBar();
            this.updateNavigationButtons();
            console.log('[DEBUG] First section displayed');
        }
    }

    initializeEventListeners() {
        console.log('[DEBUG] Setting up event listeners');
        
        // כפתורי ניווט
        document.getElementById('prevBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.prevSection();
        });

        document.getElementById('nextBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSection();
        });

        document.getElementById('submitBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        // מעקב אחר שינויים בטופס
        const form = document.getElementById('mainForm');
        form?.addEventListener('input', () => {
            this.hasChanges = true;
            this.autoSave();
        });

        // מניעת יציאה בטעות
        window.addEventListener('beforeunload', (e) => {
            if (this.hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    initializeSignaturePad() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) {
            console.warn('[WARN] Signature canvas not found');
            return;
        }

        this.signaturePad = new SignaturePad(canvas);

        // כפתורי חתימה
        document.querySelector('[data-clear-signature]')?.addEventListener('click', () => {
            this.signaturePad.clear();
            console.log('[DEBUG] Signature cleared');
        });

        document.querySelector('[data-save-signature]')?.addEventListener('click', () => {
            if (!this.signaturePad.isEmpty()) {
                const signatureData = this.signaturePad.toDataURL();
                localStorage.setItem('savedSignature', signatureData);
                this.showMessage('החתימה נשמרה', 'success');
                console.log('[DEBUG] Signature saved');
            }
        });
    }

    initializeDebugPanel() {
        const debugPanel = document.querySelector('.debug-panel');
        if (debugPanel) {
            debugPanel.style.display = 'block';
        }

        document.getElementById('checkLogsBtn')?.addEventListener('click', () => {
            this.checkLogs();
        });
    }

    updateProgressBar() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            if (index <= this.currentSection) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.style.display = this.currentSection === 0 ? 'none' : 'block';
        }
        if (nextBtn) {
            nextBtn.style.display = this.currentSection === this.sections.length - 1 ? 'none' : 'block';
        }
        if (submitBtn) {
            submitBtn.style.display = this.currentSection === this.sections.length - 1 ? 'block' : 'none';
        }
    }

    async loadSavedData() {
        try {
            const savedData = localStorage.getItem('formData');
            if (savedData) {
                this.formData = JSON.parse(savedData);
                this.populateFormFields();
                console.log('[DEBUG] Loaded saved data');
            }
        } catch (error) {
            console.error('[ERROR] Failed to load saved data:', error);
        }
    }

    populateFormFields() {
        Object.entries(this.formData).forEach(([name, value]) => {
            const field = document.querySelector(`[name="${name}"]`);
            if (field) {
                field.value = value;
            }
        });
    }

    autoSave() {
        const form = document.getElementById('mainForm');
        if (!form) return;

        const formData = new FormData(form);
        this.formData = Object.fromEntries(formData.entries());
        localStorage.setItem('formData', JSON.stringify(this.formData));
        console.log('[DEBUG] Form auto-saved');
    }

    nextSection() {
        if (this.currentSection >= this.sections.length - 1) return;

        // בדיקת תקינות הסקשן הנוכחי
        const currentFields = this.sections[this.currentSection].querySelectorAll('input, select, textarea');
        const isValid = Array.from(currentFields).every(field => field.checkValidity());

        if (!isValid) {
            this.showMessage('נא למלא את כל השדות הנדרשים', 'error');
            return;
        }

        // מעבר לסקשן הבא
        this.sections[this.currentSection].style.display = 'none';
        this.sections[this.currentSection].classList.remove('active');
        
        this.currentSection++;
        
        this.sections[this.currentSection].style.display = 'block';
        this.sections[this.currentSection].classList.add('active');

        this.updateProgressBar();
        this.updateNavigationButtons();
        window.scrollTo(0, 0);
        
        console.log(`[DEBUG] Moved to section ${this.currentSection + 1}`);
    }

    prevSection() {
        if (this.currentSection <= 0) return;

        this.sections[this.currentSection].style.display = 'none';
        this.sections[this.currentSection].classList.remove('active');
        
        this.currentSection--;
        
        this.sections[this.currentSection].style.display = 'block';
        this.sections[this.currentSection].classList.add('active');

        this.updateProgressBar();
        this.updateNavigationButtons();
        window.scrollTo(0, 0);
        
        console.log(`[DEBUG] Moved back to section ${this.currentSection + 1}`);
    }

    async submitForm() {
        try {
            console.log('[DEBUG] Starting form submission');
            this.showLoader();

            // בדיקת תקינות הטופס
            const form = document.getElementById('mainForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                throw new Error('נא למלא את כל השדות הנדרשים');
            }

            // בדיקת חתימה
            if (!this.signaturePad || this.signaturePad.isEmpty()) {
                throw new Error('נא לחתום על הטופס');
            }

            // הכנת הנתונים לשליחה
            const formData = new FormData(form);
            const submission = Object.fromEntries(formData.entries());
            submission.signature = this.signaturePad.toDataURL();

            // המתנה לפיירבייס
            await window.firebaseService.waitForReady();

            // יצירת PDF
            const pdfBlob = await this.generatePDF();
            
            // העלאת PDF
            const fileName = `forms/${Date.now()}_${submission.idNumber || 'unknown'}.pdf`;
            const pdfUrl = await window.firebaseService.uploadFile(pdfBlob, fileName);
            
            // שמירה בפיירסטור
            submission.pdfUrl = pdfUrl;
            const docId = await window.firebaseService.saveForm(submission);

            console.log('[DEBUG] Form submitted successfully:', docId);

            // ניקוי נתונים שמורים
            localStorage.removeItem('formData');
            this.hasChanges = false;

            // הצגת הודעת הצלחה והפניה
            this.showMessage('הטופס נשלח בהצלחה!', 'success');
            setTimeout(() => {
                window.location.href = '/thank-you.html';
            }, 2000);

        } catch (error) {
            console.error('[ERROR] Submit failed:', error);
            this.showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // הוספת תוכן הטופס ל-PDF
        Object.entries(this.formData).forEach(([key, value], index) => {
            doc.text(`${key}: ${value}`, 10, 10 + (index * 10));
        });

        // הוספת חתימה
        if (this.signaturePad) {
            const signatureImage = this.signaturePad.toDataURL();
            doc.addImage(signatureImage, 'PNG', 10, 10 + (Object.keys(this.formData).length * 10));
        }

        return doc.output('blob');
    }

    showMessage(text, type = 'error') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            color: white;
            background: ${type === 'success' ? '#4CAF50' : '#dc3545'};
            animation: fadeIn 0.3s;
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }

    showLoader() {
        const loader = document.querySelector('.loader');
        if (loader) loader.style.display = 'block';
    }

    hideLoader() {
        const loader = document.querySelector('.loader');
        if (loader) loader.style.display = 'none';
    }

    checkLogs() {
        console.log('='.repeat(50));
        console.log('[DEBUG] Form Status Check');
        console.log('-'.repeat(50));
        console.log('Current Section:', this.currentSection);
        console.log('Total Sections:', this.sections.length);
        console.log('Form Data:', this.formData);
        console.log('Has Changes:', this.hasChanges);
        console.log('Firebase Status:', window.db ? 'Connected' : 'Not Connected');
        console.log('Current Section Content:', this.sections[this.currentSection]?.innerHTML);
        console.log('Signature Status:', this.signaturePad ? 
            (!this.signaturePad.isEmpty() ? 'Signed' : 'Empty') : 
            'Not Initialized');

        // עדכון פאנל דיבאג
        const debugOutput = document.getElementById('debugOutput');
        if (debugOutput) {
            debugOutput.innerHTML = `
                <div class="debug-info">
                    <p>סקשן נוכחי: ${this.currentSection + 1}/${this.sections.length}</p>
                    <p>מצב שמירה: ${this.hasChanges ? 'יש שינויים' : 'אין שינויים'}</p>
                    <p>חתימה: ${this.signaturePad ? 
                        (!this.signaturePad.isEmpty() ? 'חתום' : 'ריק') : 
                        'לא מאותחל'}</p>
                    <p>Firebase: ${window.db ? 'מחובר' : 'לא מחובר'}</p>
                </div>
            `;
        }
    }
}

// אתחול המחלקה כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOM loaded, initializing form handler');
    new FormHandler();
});
