// public/js/signatureHandler.js
class SignatureHandler {
    constructor() {
        this.initialize();
    }

    initialize() {
        document.querySelectorAll('.signature-canvas').forEach(canvas => {
            if (!canvas) return;

            const signaturePad = new SignaturePad(canvas, {
                minWidth: 1,
                maxWidth: 2.5,
                backgroundColor: 'rgb(255, 255, 255)'
            });

            this.setupCanvas(canvas, signaturePad);
            this.setupButtons(canvas, signaturePad);
        });
    }

    setupCanvas(canvas, signaturePad) {
        const resizeCanvas = () => {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            signaturePad.clear();
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
    }

    setupButtons(canvas, signaturePad) {
        // Clear button
        const clearBtn = document.querySelector(`[data-clear-for="${canvas.id}"]`);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                signaturePad.clear();
                this.updateHiddenInput(canvas.id, '');
            });
        }

        // Copy button
        const copyBtn = document.querySelector(`[data-copy-for="${canvas.id}"]`);
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const previousSignature = localStorage.getItem('signature');
                if (previousSignature) {
                    signaturePad.fromDataURL(previousSignature);
                    this.updateHiddenInput(canvas.id, previousSignature);
                } else {
                    alert('לא נמצאה חתימה קודמת');
                }
            });
        }

        // Save signature on end
        signaturePad.addEventListener("endStroke", () => {
            const signatureData = signaturePad.toDataURL();
            localStorage.setItem('signature', signatureData);
            this.updateHiddenInput(canvas.id, signatureData);
        });
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
