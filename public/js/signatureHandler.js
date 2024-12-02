// public/js/signatureHandler.js

class SignatureHandler {
    constructor() {
        // בדיקה האם אנחנו בסקשן 1
        if (window.location.pathname.includes('section1')) return;
        
        this.signaturePad = null;
        this.initialize();
        this.initializeValidation();
    }

    initialize() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;

        this.signaturePad = new SignaturePad(canvas, {
            minWidth: 1,
            maxWidth: 2.5,
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });

        // Set up event listeners
        this.setupListeners();
        
        // Set up resize handling
        this.handleResize();

        // Check for previous signature
        this.loadPreviousSignature();
    }

    setupListeners() {
        const clearButton = document.querySelector('[data-clear-signature]');
        const copyButton = document.querySelector('[data-copy-signature]');

        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearSignature());
        }

        if (copyButton) {
            copyButton.addEventListener('click', () => this.loadPreviousSignature());
        }

        if (this.signaturePad) {
            this.signaturePad.onEnd = () => {
                const data = this.signaturePad.toDataURL();
                this.saveSignature(data);
                this.updateFinalSubmit();
            };
        }
    }

    handleResize() {
        const resizeCanvas = () => {
            const canvas = document.getElementById('signatureCanvas');
            if (!canvas) return;

            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = 200 * ratio;
            const context = canvas.getContext('2d');
            context.scale(ratio, ratio);
            
            // Redraw previous signature if exists
            const previousData = this.signaturePad.toDataURL();
            this.signaturePad.clear();
            if (previousData && !this.signaturePad.isEmpty()) {
                this.signaturePad.fromDataURL(previousData);
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    clearSignature() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            this.saveSignature('');
            this.updateFinalSubmit();
        }
    }

    loadPreviousSignature() {
        const previousSignature = localStorage.getItem('lastSignature');
        if (previousSignature && this.signaturePad) {
            this.signaturePad.fromDataURL(previousSignature);
            this.saveSignature(previousSignature);
            this.updateFinalSubmit();
        } else {
            alert('לא נמצאה חתימה קודמת');
        }
    }

    saveSignature(data) {
        if (data) {
            localStorage.setItem('lastSignature', data);
        }
        const input = document.getElementById('signatureData');
        if (input) {
            input.value = data;
        }
    }

    updateFinalSubmit() {
        if (window.location.pathname.includes('section4')) {
            const submitButton = document.getElementById('finalSubmit');
            const checkboxes = document.querySelectorAll('input[type="checkbox"][required]');
            const hasSignature = !this.signaturePad.isEmpty();
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);

            if (submitButton) {
                submitButton.disabled = !(hasSignature && allChecked);
            }
        }
    }

    initializeValidation() {
        if (window.location.pathname.includes('section4')) {
            const checkboxes = document.querySelectorAll('input[type="checkbox"][required]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => this.updateFinalSubmit());
            });
        }
    }
}

// Initialize only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
