class SignatureHandler {
    constructor() {
        if (window.location.pathname.includes('section1')) return;
        this.signaturePad = null;
        this.initialize();
    }

    initialize() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;

        this.signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
            minWidth: 1,
            maxWidth: 2.5
        });

        // Set up buttons
        const clearButton = document.querySelector('[data-clear-signature]');
        const copyButton = document.querySelector('[data-copy-signature]');

        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearSignature());
        }

        if (copyButton) {
            copyButton.addEventListener('click', () => this.loadPreviousSignature());
        }

        // Set up auto-save
        canvas.addEventListener('mouseup', () => this.saveSignature());
        canvas.addEventListener('touchend', () => this.saveSignature());

        // Set up canvas resize
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Try to load previous signature
        if (!window.location.pathname.includes('section1')) {
            const previousSignature = localStorage.getItem('lastSignature');
            if (previousSignature) {
                this.signaturePad.fromDataURL(previousSignature);
                this.updateSignatureInput(previousSignature);
            }
        }
    }

    resizeCanvas() {
        const canvas = document.getElementById('signatureCanvas');
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const context = canvas.getContext('2d');

        // Store current signature data
        const data = this.signaturePad.toData();

        // Resize canvas
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = 200 * ratio;
        context.scale(ratio, ratio);

        // Restore signature data
        this.signaturePad.clear();
        if (data) {
            this.signaturePad.fromData(data);
        }
    }

    clearSignature() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            this.updateSignatureInput('');
        }
    }

    loadPreviousSignature() {
        const previousSignature = localStorage.getItem('lastSignature');
        if (previousSignature) {
            this.signaturePad.fromDataURL(previousSignature);
            this.updateSignatureInput(previousSignature);
        } else {
            alert('לא נמצאה חתימה קודמת');
        }
    }

    saveSignature() {
        if (this.signaturePad && !this.signaturePad.isEmpty()) {
            const signatureData = this.signaturePad.toDataURL();
            localStorage.setItem('lastSignature', signatureData);
            this.updateSignatureInput(signatureData);
        }
    }

    updateSignatureInput(value) {
        const input = document.getElementById('signatureData');
        if (input) {
            input.value = value;
            // Trigger change event for form validation
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
