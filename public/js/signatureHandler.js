class SignatureHandler {
    constructor() {
        this.signaturePad = null;
        this.isDrawing = false;
        
        // Check if we should initialize signature pad
        if (this.shouldInitializeSignature()) {
            this.initialize();
        }
    }

    shouldInitializeSignature() {
        // Only initialize for sections 2, 3, and 4
        const currentSection = window.location.pathname;
        return currentSection.includes('section2') || 
               currentSection.includes('section3') || 
               currentSection.includes('section4');
    }

    initialize() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;

        this.signaturePad = new SignaturePad(canvas, {
            minWidth: 0.5,
            maxWidth: 2.5,
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.setupButtons();
    }

    resizeCanvas() {
        if (!this.signaturePad) return;
        
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;

        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = 200 * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
    }

    setupButtons() {
        const clearButton = document.querySelector('[data-clear-signature]');
        const copyButton = document.querySelector('[data-copy-signature]');
        const saveButton = document.querySelector('[data-save-signature]');

        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearSignature());
        }
        if (copyButton) {
            copyButton.addEventListener('click', () => this.copyPreviousSignature());
        }
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveCurrentSignature());
        }

        if (this.signaturePad) {
            this.signaturePad.onEnd = () => {
                if (!this.signaturePad.isEmpty()) {
                    const signatureData = this.signaturePad.toDataURL();
                    this.updateSignatureInput(signatureData);
                }
            };
        }
    }

    clearSignature() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            this.updateSignatureInput('');
        }
    }

    saveCurrentSignature() {
        if (this.signaturePad && !this.signaturePad.isEmpty()) {
            const signatureData = this.signaturePad.toDataURL();
            localStorage.setItem('lastSignature', signatureData);
            this.updateSignatureInput(signatureData);
        }
    }

    copyPreviousSignature() {
        const previousSignature = localStorage.getItem('lastSignature');
        if (previousSignature && this.signaturePad) {
            this.signaturePad.fromDataURL(previousSignature);
            this.updateSignatureInput(previousSignature);
        } else {
            alert('לא נמצאה חתימה קודמת');
        }
    }

    updateSignatureInput(value) {
        const input = document.getElementById('signatureData');
        if (input) {
            input.value = value;
        }
    }
}

// Initialize the handler only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
