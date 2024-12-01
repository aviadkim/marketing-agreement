class SignatureHandler {
    constructor() {
        this.initialize();
    }

    initialize() {
        document.querySelectorAll('.signature-canvas').forEach(canvas => {
            if (!canvas) return;
            
            try {
                // Create signature pad
                const signaturePad = new SignaturePad(canvas, {
                    minWidth: 1,
                    maxWidth: 2.5,
                    throttle: 16,
                    backgroundColor: 'rgb(255, 255, 255)',
                    penColor: 'rgb(0, 0, 0)'
                });

                // Canvas setup
                this.resizeCanvas(canvas, signaturePad);
                window.addEventListener('resize', () => this.resizeCanvas(canvas, signaturePad));

                // Button handlers
                const clearBtn = document.querySelector(`[data-clear-for="${canvas.id}"]`);
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        signaturePad.clear();
                        this.updateHiddenInput(canvas.id, '');
                    });
                }

                const copyBtn = document.querySelector(`[data-copy-for="${canvas.id}"]`);
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
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

                // Save signature when drawing ends
                signaturePad.onEnd = () => {
                    if (!signaturePad.isEmpty()) {
                        const data = signaturePad.toDataURL();
                        localStorage.setItem('signature', data);
                        this.updateHiddenInput(canvas.id, data);
                    }
                };

            } catch (error) {
                console.error('Error initializing SignaturePad:', error);
            }
        });
    }

    resizeCanvas(canvas, signaturePad) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const context = canvas.getContext("2d");
        
        const data = signaturePad.toData();
        
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        context.scale(ratio, ratio);
        
        signaturePad.clear();
        if (data) {
            signaturePad.fromData(data);
        }
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
document.addEventListener('DOMContentLoaded', () => {
    new SignatureHandler();
});
