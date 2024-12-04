class SignatureHandler {
    constructor() {
        this.signaturePad = null;
        this.isDrawing = false;
        this.currentSection = this.getCurrentSection();
        this.loadSavedSignature = this.loadSavedSignature.bind(this);
        this.initialize();
    }

    getCurrentSection() {
        const path = window.location.pathname;
        const match = path.match(/section(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    loadSavedSignature() {
        if (!this.signaturePad || this.currentSection === 4) return;
        
        const savedSignature = localStorage.getItem('lastSignature');
        if (savedSignature) {
            this.signaturePad.fromDataURL(savedSignature);
            this.updateSignatureInput(savedSignature);
        }
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

        if (this.currentSection === 4) {
            this.clearSignature();
        } else {
            this.loadSavedSignature();
        }
    }

    resizeCanvas() {
        if (!this.signaturePad) return;
        
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;
        
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = 200 * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        
        if (this.currentSection !== 4) {
            const savedSignature = localStorage.getItem('lastSignature');
            if (savedSignature) {
                this.signaturePad.fromDataURL(savedSignature);
            }
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
                    this.updateSignatureInput(signatureData);
                    if (this.currentSection !== 4) {
                        localStorage.setItem('lastSignature', signatureData);
                    }
                    if (window.checkFormValidity) {
                        window.checkFormValidity();
                    }
                }
            };
        }
    }

    clearSignature() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            this.updateSignatureInput('');
            if (this.currentSection !== 4) {
                localStorage.removeItem('lastSignature');
            }
            if (window.checkFormValidity) {
                window.checkFormValidity();
            }
        }
    }

    copyPreviousSignature() {
        if (this.signaturePad) {
            const previousSignature = localStorage.getItem('lastSignature');
            if (previousSignature) {
                this.signaturePad.fromDataURL(previousSignature);
                this.updateSignatureInput(previousSignature);
                if (window.checkFormValidity) {
                    window.checkFormValidity();
                }
            } else {
                window.showMessage('לא נמצאה חתימה קודמת', 'error');
            }
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

document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
