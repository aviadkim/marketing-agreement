// public/js/signatureHandler.js

class SignatureHandler {
    constructor() {
        this.signaturePads = new Map();
        this.initialize();
        this.lastSignature = localStorage.getItem('lastSignature');
    }

    initialize() {
        // Initialize all signature pads on the page
        document.querySelectorAll('.signature-canvas').forEach(canvas => {
            const signaturePad = new SignaturePad(canvas, {
                minWidth: 1,
                maxWidth: 2.5,
                backgroundColor: 'rgb(255, 255, 255)'
            });

            this.signaturePads.set(canvas.id, signaturePad);
            this.setupCanvas(canvas, signaturePad);
            this.setupControls(canvas.id);
            this.setupAutoSave(canvas.id, signaturePad);
        });

        // Load last signature if exists
        if (this.lastSignature) {
            const currentSection = window.location.pathname.split('/').pop();
            if (currentSection !== 'section1.html') {
                const canvas = document.querySelector('.signature-canvas');
                if (canvas) {
                    const signaturePad = this.signaturePads.get(canvas.id);
                    signaturePad.fromDataURL(this.lastSignature);
                    this.updateHiddenInput(canvas.id, this.lastSignature);
                }
            }
        }
    }

    setupCanvas(canvas, signaturePad) {
        const resizeCanvas = () => {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            if (!signaturePad.isEmpty()) {
                const data = signaturePad.toDataURL();
                signaturePad.clear();
                signaturePad.fromDataURL(data);
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    setupControls(canvasId) {
        // Clear button
        const clearBtn = document.querySelector(`[data-clear-for="${canvasId}"]`);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSignature(canvasId));
        }

        // Copy button
        const copyBtn = document.querySelector(`[data-copy-for="${canvasId}"]`);
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyLastSignature(canvasId));
        }
    }

    setupAutoSave(canvasId, signaturePad) {
        signaturePad.addEventListener("endStroke", () => {
            if (!signaturePad.isEmpty()) {
                const signatureData = signaturePad.toDataURL();
                localStorage.setItem('lastSignature', signatureData);
                this.lastSignature = signatureData;
                this.updateHiddenInput(canvasId, signatureData);
            }
        });
    }

    clearSignature(canvasId) {
        const signaturePad = this.signaturePads.get(canvasId);
        if (signaturePad) {
            signaturePad.clear();
            this.updateHiddenInput(canvasId, '');
        }
    }

    copyLastSignature(canvasId) {
        const signaturePad = this.signaturePads.get(canvasId);
        if (signaturePad && this.lastSignature) {
            signaturePad.fromDataURL(this.lastSignature);
            this.updateHiddenInput(canvasId, this.lastSignature);
        } else {
            alert('לא נמצאה חתימה קודמת');
        }
    }

    updateHiddenInput(canvasId, value) {
        const input = document.getElementById(`${canvasId}-data`);
        if (input) {
            input.value = value;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
