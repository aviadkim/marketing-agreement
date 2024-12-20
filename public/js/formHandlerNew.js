class FormHandler {
    constructor() {
        // Prevent multiple instances
        if (window.formHandler) {
            console.log('[DEBUG] Form handler already exists');
            return window.formHandler;
        }
        console.log('[DEBUG] Initializing FormHandler');
        window.formHandler = this;

        // Initialize state
        this.currentSection = 0;
        this.formData = {};
        this.sections = document.querySelectorAll('.form-section');
        this.hasChanges = false;

        // Initialize components
        this.initializeView();
        this.initializeEventListeners();
        this.initializeSignaturePad();
        this.loadSavedData();

        return this;
    }

    initializeView() {
        console.log('[DEBUG] Initializing view');
        // Hide all sections
        this.sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Show first section
        if (this.sections[0]) {
            this.sections[0].style.display = 'block';
            this.sections[0].classList.add('active');
            this.updateProgressBar();
            this.updateNavigationButtons();
        }
    }

    initializeEventListeners() {
        console.log('[DEBUG] Setting up event listeners');
        
        // Navigation buttons
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

        // Form inputs
        const form = document.getElementById('mainForm');
        form?.addEventListener('input', () => {
            this.hasChanges = true;
            this.autoSave();
        });

        // Prevent accidental navigation
        window.addEventListener('beforeunload', (e) => {
            if (this.hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    initializeSignaturePad() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;

        this.signaturePad = new SignaturePad(canvas);

        // Signature controls
        document.querySelector('[data-clear-signature]')?.addEventListener('click', () => {
            this.signaturePad.clear();
            console.log('[DEBUG] Signature cleared');
        });

        document.querySelector('[data-save-signature]')?.addEventListener('click', () => {
            if (!this.signaturePad.isEmpty()) {
                const signatureData = this.signaturePad.toDataURL();
                localStorage.setItem('savedSignature', signatureData);
                this.showMessage('החתימה נשמרה בהצלחה', 'success');
                console.log('[DEBUG] Signature saved');
            }
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

        // Validate current section
        const currentFields = this.sections[this.currentSection].querySelectorAll('input, select, textarea');
        const isValid = Array.from(currentFields).every(field => field.checkValidity());

        if (!isValid) {
            this.showMessage('נא למלא את כל השדות הנדרשים', 'error');
            return;
        }

        // Move to next section
        this.sections[this.currentSection].style.display = 'none';
        this.sections[this.currentSection].classList.remove('active');
        
        this.currentSection++;
        
        this.sections[this.currentSection].style.display = 'block';
        this.sections[this.currentSection].classList.add('active');

        this.updateProgressBar();
        this.updateNavigationButtons();
        window.scrollTo(0, 0);
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
    }

    async submitForm() {
        try {
            console.log('[DEBUG] Starting form submission');
            this.showLoader();

            // Validate form
            const form = document.getElementById('mainForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                throw new Error('נא למלא את כל השדות הנדרשים');
            }

            // Check signature
            if (!this.signaturePad || this.signaturePad.isEmpty()) {
                throw new Error('נא לחתום על הטופס');
            }

            // Prepare form data
            const formData = new FormData(form);
            const submission = Object.fromEntries(formData.entries());
            submission.signature = this.signaturePad.toDataURL();

            // Wait for Firebase
            await window.firebaseHelpers.waitForReady();

            // Create PDF
            const pdfBlob = await this.generatePDF();
            
            // Upload PDF
            const fileName = `forms/${Date.now()}_${submission.idNumber || 'unknown'}.pdf`;
            const pdfUrl = await window.firebaseHelpers.uploadFile(pdfBlob, fileName);
            
            // Save to Firestore
            submission.pdfUrl = pdfUrl;
            const docId = await window.firebaseHelpers.saveForm(submission);

            console.log('[DEBUG] Form submitted successfully:', docId);

            // Clear saved data
            localStorage.removeItem('formData');
            this.hasChanges = false;

            // Show success message and redirect
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
        
        // Add form content to PDF
        Object.entries(this.formData).forEach(([key, value], index) => {
            doc.text(`${key}: ${value}`, 10, 10 + (index * 10));
        });

        // Add signature
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
        console.log('Form Data:', this.formData);
        console.log('Has Changes:', this.hasChanges);
        console.log('Firebase Status:', window.db ? 'Connected' : 'Not Connected');
        console.log('Signature Status:', this.signaturePad ? 
            (!this.signaturePad.isEmpty() ? 'Signed' : 'Empty') : 
            'Not Initialized');

        // Check form validity
        const form = document.getElementById('mainForm');
        const isValid = form?.checkValidity();
        console.log('Form Validity:', isValid);

        // Test Firebase connection
        if (window.db) {
            window.db.collection('test').add({
                test: 'Connection Test',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => console.log('[DEBUG] Firebase Write Test: Success'))
            .catch(err => console.error('[ERROR] Firebase Write Test:', err));
        }

        console.log('-'.repeat(50));

        // Show debug panel if exists
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

// Initialize form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOM loaded, initializing form handler');
    if (!window.formHandler) {
        new FormHandler();
    }
});
