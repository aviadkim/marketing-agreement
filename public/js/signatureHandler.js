// signatureHandler.js
class SignatureHandler {
    constructor() {
        if (typeof SignaturePad === 'undefined') {
            console.error('SignaturePad library not loaded');
            return;
        }
        this.initialize();
    }

    initialize() {
        document.querySelectorAll('.signature-canvas').forEach(canvas => {
            if (!canvas) return;
            
            try {
                const signaturePad = new SignaturePad(canvas, {
                    minWidth: 1,
                    maxWidth: 2.5,
                    throttle: 16,
                    backgroundColor: 'rgb(255, 255, 255)',
                    penColor: 'rgb(0, 0, 0)'
                });

                this.setupCanvas(canvas, signaturePad);
                this.setupButtons(canvas, signaturePad);
                this.attachEvents(canvas, signaturePad);

            } catch (error) {
                console.error('Error initializing SignaturePad:', error);
            }
        });
    }

    setupCanvas(canvas, signaturePad) {
        const resizeCanvas = () => {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const context = canvas.getContext("2d");
            
            // Save current data
            const data = signaturePad.toData();
            
            // Adjust canvas size
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            context.scale(ratio, ratio);
            
            // Restore data
            signaturePad.clear();
            if (data) {
                signaturePad.fromData(data);
            }
        };

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("orientationchange", () => {
            setTimeout(resizeCanvas, 100);
        });
        resizeCanvas();
    }

    setupButtons(canvas, signaturePad) {
        const clearButton = document.querySelector(`[data-clear-for="${canvas.id}"]`);
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                signaturePad.clear();
                this.updateHiddenInput(canvas.id, '');
            });
        }

        const copyButton = document.querySelector(`[data-copy-for="${canvas.id}"]`);
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const previousSignature = localStorage.getItem('signature');
                if (previousSignature) {
                    const image = new Image();
                    image.onload = () => {
                        signaturePad.clear();
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                        this.updateHiddenInput(canvas.id, previousSignature);
                    };
                    image.src = previousSignature;
                } else {
                    alert('לא נמצאה חתימה קודמת');
                }
            });
        }
    }

    attachEvents(canvas, signaturePad) {
        signaturePad.addEventListener("beginStroke", () => {
            const container = canvas.closest('.signature-container');
            if (container) {
                container.classList.add('signature-active');
            }
        });

        signaturePad.addEventListener("endStroke", () => {
            if (!signaturePad.isEmpty()) {
                const signatureData = signaturePad.toDataURL('image/png');
                localStorage.setItem('signature', signatureData);
                this.updateHiddenInput(canvas.id, signatureData);
                
                const container = canvas.closest('.signature-container');
                if (container) {
                    container.classList.remove('signature-active');
                    container.classList.add('signature-valid');
                }
            }
        });
    }

    updateHiddenInput(canvasId, value) {
        const input = document.getElementById(`${canvasId}-data`);
        if (input) {
            input.value = value;
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.signatureHandler = new SignatureHandler();
    });
} else {
    window.signatureHandler = new SignatureHandler();
}
