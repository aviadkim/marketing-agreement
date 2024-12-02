class SignatureHandler {
    constructor() {
        // אל תפעיל את הפאד בעמוד 1
        if (window.location.pathname.includes('section1.html')) {
            console.log('Skipping Signature Pad on Section 1');
            return;
        }

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

        // אתחל גודל הקנבס
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // טען חתימה שמורה אם קיימת
        const savedSignature = localStorage.getItem('lastSignature');
        if (savedSignature) {
            this.signaturePad.fromDataURL(savedSignature);
            console.log('Loaded saved signature');
        }

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
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearSignature());
        }

        if (this.signaturePad) {
            this.signaturePad.onEnd = () => {
                if (!this.signaturePad.isEmpty()) {
                    const signatureData = this.signaturePad.toDataURL();
                    localStorage.setItem('lastSignature', signatureData);
                    console.log('Saved signature to LocalStorage');
                }
            };
        }
    }

    clearSignature() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            localStorage.removeItem('lastSignature');
            console.log('Cleared signature and removed from LocalStorage');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SignatureHandler();
});
