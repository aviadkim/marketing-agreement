class FormHandler {
    constructor() {
        if (window.formHandler) {
            console.log('[DEBUG] Form handler already initialized');
            return;
        }
        window.formHandler = this;
        
        console.log('[DEBUG] Initializing FormHandler');
        this.formData = {};
        this.initializeForm();
    }

    initializeForm() {
        // מאזין לכל השינויים בטופס
        const form = document.querySelector('form');
        if (!form) {
            console.error('[ERROR] Form not found');
            return;
        }

        // שמירה אוטומטית בכל שינוי
        form.addEventListener('change', () => this.autoSave());
        
        // אתחול חתימה
        this.initializeSignaturePad();

        // כפתור שליחה
        form.addEventListener('submit', (e) => this.submitForm(e));

        // טעינת מידע שמור
        this.loadSavedData();
    }

    initializeSignaturePad() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) {
            console.warn('[WARN] Signature canvas not found');
            return;
        }

        this.signaturePad = new SignaturePad(canvas);
        
        document.querySelector('[data-clear-signature]')?.addEventListener('click', () => {
            this.signaturePad.clear();
        });

        document.querySelector('[data-copy-signature]')?.addEventListener('click', () => {
            const savedSig = localStorage.getItem('savedSignature');
            if (savedSig) {
                this.signaturePad.fromDataURL(savedSig);
            }
        });

        document.querySelector('[data-save-signature]')?.addEventListener('click', () => {
            if (!this.signaturePad.isEmpty()) {
                localStorage.setItem('savedSignature', this.signaturePad.toDataURL());
                this.showMessage('החתימה נשמרה', 'success');
            }
        });
    }

    async autoSave() {
        const form = document.querySelector('form');
        if (!form) return;

        const formData = new FormData(form);
        this.formData = {
            ...this.formData,
            ...Object.fromEntries(formData)
        };
        localStorage.setItem('formData', JSON.stringify(this.formData));
        console.log('[DEBUG] Form data saved:', this.formData);
    }

    loadSavedData() {
        const savedData = localStorage.getItem('formData');
        if (savedData) {
            try {
                this.formData = JSON.parse(savedData);
                this.populateForm();
            } catch (error) {
                console.error('[ERROR] Failed to load saved data:', error);
            }
        }
    }

    populateForm() {
        Object.entries(this.formData).forEach(([key, value]) => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = value === 'true' || value === true;
                } else {
                    input.value = value;
                }
            }
        });
    }

    async generatePDF() {
        const form = document.querySelector('.form-container');
        const canvas = await html2canvas(form, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        return pdf;
    }

    async submitForm(e) {
        e.preventDefault();
        console.log('[DEBUG] Starting form submission');

        try {
            // הצגת לוודר
            this.showLoader();

            // בדיקת תקינות
            const form = document.querySelector('form');
            if (!form.checkValidity()) {
                form.reportValidity();
                throw new Error('נא למלא את כל השדות הנדרשים');
            }

            // בדיקת חתימה
            if (!this.signaturePad || this.signaturePad.isEmpty()) {
                throw new Error('נא לחתום על הטופס');
            }

            // יצירת PDF
            const pdf = await this.generatePDF();
            const pdfBlob = pdf.output('blob');

            // העלאת PDF לStorage
            const fileName = `forms/${Date.now()}.pdf`;
            const storageRef = window.storage.ref(fileName);
            await storageRef.put(pdfBlob);
            const pdfUrl = await storageRef.getDownloadURL();

            // שמירת נתונים ב-Firestore
            const submission = {
                ...this.formData,
                signature: this.signaturePad.toDataURL(),
                pdfUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            await window.db.collection('submissions').add(submission);

            // הצגת הודעת הצלחה
            this.showMessage('הטופס נשלח בהצלחה!', 'success');
            
            // ניקוי והפניה לדף תודה
            localStorage.removeItem('formData');
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

    showLoader() {
        const loader = document.querySelector('.loader');
        if (loader) loader.style.display = 'block';
    }

    hideLoader() {
        const loader = document.querySelector('.loader');
        if (loader) loader.style.display = 'none';
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
}

// Initialize only once when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Starting form initialization');
    new FormHandler();
});
