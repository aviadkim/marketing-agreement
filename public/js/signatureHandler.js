// public/js/signatureHandler.js
class SignatureHandler {
    constructor() {
        this.signaturePads = new Map();
        this.lastSignature = localStorage.getItem('lastSignature');
        this.initialize();
        this.setupFormValidation();
    }

    initialize() {
        document.querySelectorAll('.signature-canvas').forEach(canvas => {
            if (!canvas) return;
            
            // Create signature pad
            const signaturePad = new SignaturePad(canvas, {
                minWidth: 1,
                maxWidth: 2.5,
                backgroundColor: 'rgb(255, 255, 255)'
            });

            // Store in map
            this.signaturePads.set(canvas.id, signaturePad);

            // Setup canvas
            this.resizeCanvas(canvas, signaturePad);
            window.addEventListener('resize', () => this.resizeCanvas(canvas, signaturePad));

            // Setup controls
            this.setupControls(canvas.id);

            // Load saved signature if exists (except for section 1)
            if (this.lastSignature && !window.location.href.includes('section1')) {
                signaturePad.fromDataURL(this.lastSignature);
                this.updateHiddenInput(canvas.id, this.lastSignature);
            }

            // Setup auto-save
            signaturePad.onEnd = () => {
                const signatureData = signaturePad.toDataURL();
                localStorage.setItem('lastSignature', signatureData);
                this.lastSignature = signatureData;
                this.updateHiddenInput(canvas.id, signatureData);
            };
        });
    }

    resizeCanvas(canvas, signaturePad) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const context = canvas.getContext('2d');
        
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        context.scale(ratio, ratio);
        signaturePad.clear(); // Clear and reset signature pad
    }

    setupControls(canvasId) {
        const clearBtn = document.querySelector(`[data-clear-for="${canvasId}"]`);
        const copyBtn = document.querySelector(`[data-copy-for="${canvasId}"]`);
        const signaturePad = this.signaturePads.get(canvasId);

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                signaturePad.clear();
                this.updateHiddenInput(canvasId, '');
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (this.lastSignature) {
                    signaturePad.fromDataURL(this.lastSignature);
                    this.updateHiddenInput(canvasId, this.lastSignature);
                } else {
                    alert('לא נמצאה חתימה קודמת');
                }
            });
        }
    }

    updateHiddenInput(canvasId, value) {
        const input = document.getElementById(`${canvasId}-data`);
        if (input) {
            input.value = value;
            // Trigger input event for form validation
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    setupFormValidation() {
        const form = document.querySelector('form');
        const nextButton = document.getElementById('saveAndContinue');
        
        if (form && nextButton) {
            nextButton.addEventListener('click', (e) => {
                const isFormValid = form.checkValidity();
                const signatureInput = form.querySelector('input[name="signature"]');
                
                if (!isFormValid || (signatureInput && !signatureInput.value)) {
                    e.preventDefault();
                    alert('נא למלא את כל השדות הנדרשים כולל חתימה');
                    return false;
                }
            });
        }
    }

    isSignatureEmpty(canvasId) {
        const signaturePad = this.signaturePads.get(canvasId);
        return signaturePad ? signaturePad.isEmpty() : true;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
