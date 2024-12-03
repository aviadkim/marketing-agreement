class SignatureHandler {
    constructor() {
        // Check if we're on the first section
        const isSection1 = window.location.pathname.includes('section1');
        if (isSection1) {
            console.log('Section 1 - Skip signature initialization');
            return;
        }

        this.signaturePad = null;
        this.isDrawing = false;
        this.initialize();
        this.loadSavedSignature(); // Load saved signature
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
        
        // Restore signature after resize if exists
        const savedSignature = localStorage.getItem('lastSignature');
        if (savedSignature) {
            this.signaturePad.fromDataURL(savedSignature);
        }
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

        if (this.signaturePad) {
            this.signaturePad.onEnd = () => {
                if (!this.signaturePad.isEmpty()) {
                    const signatureData = this.signaturePad.toDataURL();
                    this.saveSignature(signatureData);
                }
            };
        }
    }

    saveSignature(signatureData) {
        localStorage.setItem('lastSignature', signatureData);
        this.updateSignatureInput(signatureData);
    }

    loadSavedSignature() {
        const savedSignature = localStorage.getItem('lastSignature');
        if (savedSignature && this.signaturePad) {
            this.signaturePad.fromDataURL(savedSignature);
            this.updateSignatureInput(savedSignature);
        }
    }

    clearSignature() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            localStorage.removeItem('lastSignature');
            this.updateSignatureInput('');
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

    isEmpty() {
        return this.signaturePad ? this.signaturePad.isEmpty() : true;
    }
}

// Initialize only if not in section1
if (!window.location.pathname.includes('section1')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.signatureHandler = new SignatureHandler();
    });
}
