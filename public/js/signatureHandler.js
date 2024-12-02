// public/js/signatureHandler.js

class SignatureHandler {
    constructor() {
        this.signaturePads = new Map();
        this.lastSignature = localStorage.getItem('lastSignature');
        this.initialize();
    }

    initialize() {
        // Skip initialization if we're on section1
        if (window.location.pathname.includes('section1')) return;

        const canvas = document.querySelector('.signature-canvas');
        if (!canvas) return;

        // Initialize SignaturePad
        const signaturePad = new SignaturePad(canvas, {
            minWidth: 1,
            maxWidth: 2.5,
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });

        // Store in map
        this.signaturePads.set(canvas.id, signaturePad);

        // Set up resize handling
        this.setupResize(canvas, signaturePad);

        // Set up controls
        this.setupControls(canvas.id);

        // Load previous signature if exists (except for section1)
        if (this.lastSignature) {
            signaturePad.fromDataURL(this.lastSignature);
            this.updateHiddenInput(canvas.id, this.lastSignature);
        }

        // Set up save on end
        signaturePad.onEnd = () => {
            if (!signaturePad.isEmpty()) {
                const data = signaturePad.toDataURL();
                localStorage.setItem('lastSignature', data);
                this.lastSignature = data;
                this.updateHiddenInput(canvas.id, data);
                this.updateSubmitButton();
            }
        };
    }

    setupResize(canvas, signaturePad) {
        const resizeCanvas = () => {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            signaturePad.clear();
            if (this.lastSignature) {
                signaturePad.fromDataURL(this.lastSignature);
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    setupControls(canvasId) {
        const clearBtn = document.querySelector(`button[data-clear-signature]`);
        const copyBtn = document.querySelector(`button[data-copy-signature]`);
        const signaturePad = this.signaturePads.get(canvasId);

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                signaturePad.clear();
                this.updateHiddenInput(canvasId, '');
                this.updateSubmitButton();
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const lastSignature = localStorage.getItem('lastSignature');
                if (lastSignature) {
                    signaturePad.fromDataURL(lastSignature);
                    this.updateHiddenInput(canvasId, lastSignature);
                    this.updateSubmitButton();
                } else {
                    alert('לא נמצאה חתימה קודמת');
                }
            });
        }
    }

    updateHiddenInput(canvasId, value) {
        const input = document.getElementById('signatureData');
        if (input) {
            input.value = value;
        }
    }

    updateSubmitButton() {
        const submitBtn = document.querySelector('#finalSubmit');
        if (!submitBtn) return;

        const signatureInput = document.getElementById('signatureData');
        const checkboxes = document.querySelectorAll('input[type="checkbox"][required]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        const hasSignature = signatureInput && signatureInput.value;

        submitBtn.disabled = !(allChecked && hasSignature);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
