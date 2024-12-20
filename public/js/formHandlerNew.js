class FormHandler {
    constructor() {
        // Prevent multiple instances
        if (window.formHandler) {
            console.log('[DEBUG] Form handler already exists');
            return window.formHandler;
        }
        
        console.log('[DEBUG] Starting new form handler initialization');
        window.formHandler = this;

        // Initialize state
        this.currentSection = 0;
        this.formData = {};
        this.sections = document.querySelectorAll('.form-section');

        // Debug form structure
        console.log('[DEBUG] Found sections:', this.sections.length);
        this.sections.forEach((section, index) => {
            console.log(`[DEBUG] Section ${index + 1}:`, {
                id: section.id,
                visible: section.style.display !== 'none',
                content: section.innerHTML.substring(0, 100) + '...'
            });
        });

        // Check if form exists
        if (!document.getElementById('mainForm')) {
            console.error('[ERROR] Main form not found!');
            return;
        }

        // Make sure sections are visible
        this.initializeSections();
        this.initializeEventListeners();
        this.initializeSignaturePad();
        this.loadSavedData();

        return this;
    }

    initializeSections() {
        console.log('[DEBUG] Initializing sections display');
        
        // Reset all sections first
        this.sections.forEach(section => {
            section.style.position = 'relative';
            section.style.display = 'none';
            section.style.opacity = '1';
            section.style.visibility = 'visible';
        });

        // Show first section
        if (this.sections[0]) {
            this.sections[0].style.display = 'block';
            this.sections[0].classList.add('active');
            console.log('[DEBUG] First section displayed:', this.sections[0].id);
        }

        this.updateProgressBar();
        this.updateNavigationButtons();
    }

    initializeEventListeners() {
        const form = document.getElementById('mainForm');
        if (!form) {
            console.error('[ERROR] Form element not found');
            return;
        }

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

        // Save changes automatically
        form.addEventListener('input', () => {
            this.hasChanges = true;
            this.autoSave();
        });

        console.log('[DEBUG] Event listeners initialized');
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

    nextSection() {
        if (this.currentSection >= this.sections.length - 1) return;

        // Hide current section
        this.sections[this.currentSection].style.display = 'none';
        this.sections[this.currentSection].classList.remove('active');
        
        // Show next section
        this.currentSection++;
        this.sections[this.currentSection].style.display = 'block';
        this.sections[this.currentSection].classList.add('active');

        console.log(`[DEBUG] Moving to section ${this.currentSection + 1}`);
        
        this.updateProgressBar();
        this.updateNavigationButtons();
        window.scrollTo(0, 0);
    }

    prevSection() {
        if (this.currentSection <= 0) return;

        // Hide current section
        this.sections[this.currentSection].style.display = 'none';
        this.sections[this.currentSection].classList.remove('active');
        
        // Show previous section
        this.currentSection--;
        this.sections[this.currentSection].style.display = 'block';
        this.sections[this.currentSection].classList.add('active');

        console.log(`[DEBUG] Moving back to section ${this.currentSection + 1}`);
        
        this.updateProgressBar();
        this.updateNavigationButtons();
        window.scrollTo(0, 0);
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

        document.querySelector('[data-save-signature]')?.addEventListener('click', () => {
            if (!this.signaturePad.isEmpty()) {
                localStorage.setItem('savedSignature', this.signaturePad.toDataURL());
                this.showMessage('החתימה נשמרה בהצלחה', 'success');
            }
        });
    }

    async submitForm() {
        try {
            console.log('[DEBUG] Starting form submission');
            this.showLoader();

            const form = document.getElementById('mainForm');
            if (!form) throw new Error('Form not found');

            // Validate form
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

            // Create PDF
            const pdfBlob = await this.generatePDF(submission);
            
            // Upload to Firebase
            await window.firebaseHelpers.waitForReady();
            const fileName = `forms/${Date.now()}_${submission.idNumber || 'unknown'}.pdf`;
            const pdfUrl = await window.firebaseHelpers.uploadFile(pdfBlob, fileName);
            
            // Save to Firestore
            submission.pdfUrl = pdfUrl;
            await window.firebaseHelpers.saveForm(submission);

            // Clear saved data
            localStorage.removeItem('formData');
            this.hasChanges = false;

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

    async generatePDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add content to PDF
        doc.setFont('helvetica');
        doc.text('טופס הסכם שיווק השקעות', 105, 20, { align: 'center' });
        
        let y = 40;
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'signature') {
                doc.text(`${key}: ${value}`, 20, y);
                y += 10;
            }
        });

        // Add signature
        if (this.signaturePad) {
            const signatureImage = this.signaturePad.toDataURL();
            doc.addImage(signatureImage, 'PNG', 20, y, 50, 20);
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOM loaded');
    new FormHandler();
});
