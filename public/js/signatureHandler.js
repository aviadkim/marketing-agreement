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
            minWidth: 0.5,
            maxWidth: 2.5,
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });

        // רק הגדרת גודל הקנבס
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // הגדרת כפתורים
        this.setupButtons();
    }

    resizeCanvas() {
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

        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearSignature());
        }

        if (copyButton) {
            copyButton.addEventListener('click', () => this.copyPreviousSignature());
        }

        // אירוע שמירה רק בסיום חתימה
        if (this.signaturePad) {
            this.signaturePad.onEnd = () => {
                if (!this.signaturePad.isEmpty()) {
                    const signatureData = this.signaturePad.toDataURL();
                    this.updateSignatureInput(signatureData);
                    // שמירה בזיכרון רק כשלוחצים על כפתור שמירה
                    // localStorage.setItem('lastSignature', signatureData);
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

    copyPreviousSignature() {
        const previousSignature = localStorage.getItem('lastSignature');
        if (previousSignature) {
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

document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
