```javascript
class FormHandler {
    constructor() {
        // מניעת אתחול כפול
        if (window.formHandler) {
            console.log('[DEBUG] Form handler already initialized');
            return;
        }
        window.formHandler = this;
        
        console.log('[DEBUG] Initializing FormHandler');
        this.currentSection = 0;
        this.formData = {};
        this.sections = document.querySelectorAll('.form-section');

        // הסתרת כל הסקשנים בהתחלה
        this.sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // הצגת סקשן ראשון
        if (this.sections[0]) {
            this.sections[0].style.display = 'block';
            this.sections[0].classList.add('active');
            this.updateProgressBar(0);
        }

        this.initializeEventListeners();
        this.initializeSignaturePad();
        this.loadSavedData();
    }

    initializeEventListeners() {
        console.log('[DEBUG] Setting up event listeners');
        
        // ניווט באמצעות כפתורים
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSection();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevSection();
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }

        // שמירה אוטומטית בשינוי שדות
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', (e) => e.preventDefault());
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('change', () => this.autoSave());
            });
        }
    }

    initializeSignaturePad() {
        console.log('[DEBUG] Initializing signature pad');
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
            const savedSignature = localStorage.getItem('savedSignature');
            if (savedSignature) {
                this.signaturePad.fromDataURL(savedSignature);
            }
        });

        document.querySelector('[data-save-signature]')?.addEventListener('click', () => {
            if (!this.signaturePad.isEmpty()) {
                const signatureData = this.signaturePad.toDataURL();
                localStorage.setItem('savedSignature', signatureData);
                this.showMessage('החתימה נשמרה', 'success');
            }
        });
    }

    updateProgressBar(sectionIndex) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            if (index <= sectionIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    nextSection() {
        console.log('[DEBUG] Moving to next section');
        if (this.currentSection < this.sections.length - 1) {
            // הסתר נוכחי
            this.sections[this.currentSection].style.display = 'none';
            this.sections[this.currentSection].classList.remove('active');
            
            // הצג הבא
            this.currentSection++;
            this.sections[this.currentSection].style.display = 'block';
            this.sections[this.currentSection].classList.add('active');
            
            this.updateProgressBar(this.currentSection);
            this.updateNavigationButtons();
            window.scrollTo(0, 0);
        }
    }

    prevSection() {
        console.log('[DEBUG] Moving to previous section');
        if (this.currentSection > 0) {
            // הסתר נוכחי
            this.sections[this.currentSection].style.display = 'none';
            this.sections[this.currentSection].classList.remove('active');
            
            // הצג קודם
            this.currentSection--;
            this.sections[this.currentSection].style.display = 'block';
            this.sections[this.currentSection].classList.add('active');
            
            this.updateProgressBar(this.currentSection);
            this.updateNavigationButtons();
            window.scrollTo(0, 0);
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) prevBtn.style.display = this.currentSection === 0 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = this.currentSection === this.sections.length - 1 ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = this.currentSection === this.sections.length - 1 ? 'block' : 'none';
    }

    async autoSave() {
        console.log('[DEBUG] Auto-saving form data');
        const form = document.querySelector('form');
        if (!form) return;

        const formData = new FormData(form);
        this.formData = {
            ...this.formData,
            ...Object.fromEntries(formData)
        };
        localStorage.setItem('formData', JSON.stringify(this.formData));
    }

    loadSavedData() {
        console.log('[DEBUG] Loading saved form data');
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
        console.log('[DEBUG] Generating PDF');
        try {
            const form = document.querySelector('.form-container');
            const canvas = await html2canvas(form, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
            return pdf;
        } catch (error) {
            console.error('[ERROR] PDF generation failed:', error);
            throw error;
        }
    }

    async submitForm() {
        console.log('[DEBUG] Starting form submission');
        try {
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

            // שמירה בfirestore
            const submission = {
                ...this.formData,
                signature: this.signaturePad.toDataURL(),
                pdfUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            await window.db.collection('submissions').add(submission);

            // ניקוי ומעבר לדף תודה
            localStorage.removeItem('formData');
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
```
