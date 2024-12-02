// public/js/signatureHandler.js

class SignatureHandler {
    constructor() {
        // לא לאתחל בסקשן 1
        if (window.location.pathname.includes('section1')) return;
        
        this.signaturePad = null;
        this.isDrawing = false;
        this.initialize();
    }

    initialize() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;

        this.signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
            minWidth: 0.5,
            maxWidth: 2.5,
            throttle: 16,
            minDistance: 1
        });

        // הגדרת גודל הקנבס
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // הגדרת כפתורים
        this.setupButtons();

        // הגדרת אירועי עכבר/מגע
        canvas.addEventListener('mousedown', () => this.startDrawing());
        canvas.addEventListener('mouseup', () => this.stopDrawing());
        canvas.addEventListener('touchstart', () => this.startDrawing());
        canvas.addEventListener('touchend', () => this.stopDrawing());

        // טעינת חתימה קודמת אם יש
        const savedSignature = localStorage.getItem('lastSignature');
        if (savedSignature && !window.location.pathname.includes('section1')) {
            this.loadSignature(savedSignature);
        }
    }

    resizeCanvas() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;

        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const context = canvas.getContext('2d');

        // שמירת החתימה הנוכחית
        const data = this.signaturePad ? this.signaturePad.toData() : null;

        // עדכון גודל
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = 200 * ratio;
        context.scale(ratio, ratio);

        // שחזור החתימה
        if (data) {
            this.signaturePad.fromData(data);
        }
    }

    setupButtons() {
        const clearButton = document.querySelector('[data-clear-signature]');
        const copyButton = document.querySelector('[data-copy-signature]');

        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearSignature());
        }

        if (copyButton) {
            copyButton.addEventListener('click', () => this.loadPreviousSignature());
        }
    }

    startDrawing() {
        this.isDrawing = true;
    }

    stopDrawing() {
        if (this.isDrawing && this.signaturePad && !this.signaturePad.isEmpty()) {
            this.saveSignature();
        }
        this.isDrawing = false;
    }

    clearSignature() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            this.updateSignatureInput('');
            this.updateSubmitButton();
        }
    }

    loadPreviousSignature() {
        const previousSignature = localStorage.getItem('lastSignature');
        if (previousSignature) {
            this.loadSignature(previousSignature);
        } else {
            alert('לא נמצאה חתימה קודמת');
        }
    }

    loadSignature(signatureData) {
        if (this.signaturePad && signatureData) {
            this.signaturePad.fromDataURL(signatureData);
            this.updateSignatureInput(signatureData);
            this.updateSubmitButton();
        }
    }

    saveSignature() {
        if (!this.signaturePad || this.signaturePad.isEmpty()) return;

        const signatureData = this.signaturePad.toDataURL();
        localStorage.setItem('lastSignature', signatureData);
        this.updateSignatureInput(signatureData);
        this.updateSubmitButton();
    }

    updateSignatureInput(value) {
        const input = document.getElementById('signatureData');
        if (input) {
            input.value = value;
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }
    }

    updateSubmitButton() {
        if (window.location.pathname.includes('section4')) {
            const submitButton = document.getElementById('finalSubmit');
            if (submitButton && window.accordionHandler) {
                const hasSignature = !this.signaturePad.isEmpty();
                const allDeclartionsChecked = window.accordionHandler.isAllDeclartionsChecked();
                const finalConfirmation = document.querySelector('input[name="finalConfirmation"]').checked;
                
                submitButton.disabled = !(hasSignature && allDeclartionsChecked && finalConfirmation);
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
