// Check for existing instance
if (window.formHandler) {
    console.log('[DEBUG] Form handler already initialized');
    return;
}

// FormHandler class - ניהול הטופס המלא
class FormHandler {
    constructor() {
        if (window.formHandler) {
            console.log('[DEBUG] Form handler already initialized');
            return;
        }
        window.formHandler = this;
        
        console.log('[DEBUG] Initializing FormHandler');
        this.currentSection = 0;
        this.formData = {};
        this.sections = document.querySelectorAll('.form-section');
        
        // Hide all sections initially
        this.sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Show first section
        if (this.sections[0]) {
            this.sections[0].style.display = 'block';
            this.sections[0].classList.add('active');
        }

        this.initializeEventListeners();
        this.loadSavedData();
        this.updateNavigationButtons();
        this.updateProgressBar();
    }

    initializeEventListeners() {
        console.log('[DEBUG] Setting up event listeners');
        
        // כפתורי ניווט
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextSection());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevSection());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submitForm());

        // שמירה אוטומטית
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.autoSave());
        });

        // חתימה דיגיטלית
        this.initializeSignaturePad();
    }

    showCurrentSection() {
        console.log('[DEBUG] Showing section:', this.currentSection);
        this.sections.forEach((section, index) => {
            if (index === this.currentSection) {
                section.style.display = 'block';
                section.classList.add('active');
            } else {
                section.style.display = 'none';
                section.classList.remove('active');
            }
        });
        this.updateProgressBar();
        this.updateNavigationButtons();
    }

    updateProgressBar() {
        const progress = ((this.currentSection + 1) / this.sections.length) * 100;
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

        if (prevBtn) prevBtn.style.display = this.currentSection === 0 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = this.currentSection === this.sections.length - 1 ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = this.currentSection === this.sections.length - 1 ? 'block' : 'none';
    }

    nextSection() {
        console.log('[DEBUG] Moving to next section');
        if (this.currentSection < this.sections.length - 1) {
            this.currentSection++;
            this.showCurrentSection();
        }
    }

    prevSection() {
        console.log('[DEBUG] Moving to previous section');
        if (this.currentSection > 0) {
            this.currentSection--;
            this.showCurrentSection();
        }
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

    async autoSave() {
        console.log('[DEBUG] Auto-saving form data');
        const formData = new FormData(document.querySelector('form'));
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
        console.log('[DEBUG] Populating form with saved data');
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

            // Validate form
            const form = document.querySelector('form');
            if (!form.checkValidity()) {
                form.reportValidity();
                throw new Error('נא למלא את כל שדות החובה');
            }

            // Add signature
            if (this.signaturePad && !this.signaturePad.isEmpty()) {
                this.formData.signature = this.signaturePad.toDataURL();
            }

            // Generate PDF
            const pdf = await this.generatePDF();
            
            // Send to server
            const response = await fetch('/api/save-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pdfContent: pdf.output('datauristring'),
                    formData: this.formData
                })
            });

            if (!response.ok) {
                throw new Error('שגיאה בשמירת הטופס');
            }

            // Success handling
            localStorage.removeItem('formData');
            this.showMessage('הטופס נשלח בהצלחה!', 'success');
            
            // Navigate to thank you page
             setTimeout(() => {
                window.location.href = '/thankyou.html';
            }, 2000);

        } catch (error) {
            console.error('[ERROR] Form submission failed:', error);
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
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }
}

// Initialize once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Initializing form handler');
    new FormHandler();
});