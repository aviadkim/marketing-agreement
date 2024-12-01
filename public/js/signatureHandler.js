// signatureHandler.js
class SignatureHandler {
    constructor() {
        this.initialize();
    }

    initialize() {
        document.querySelectorAll('.signature-canvas').forEach(canvas => {
            if (!canvas) return;
            
            // Initialize SignaturePad with optimal settings
            const signaturePad = new SignaturePad(canvas, {
                minWidth: 1,
                maxWidth: 2.5,
                throttle: 16, // 60fps
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });

            this.setupCanvas(canvas, signaturePad);
            this.setupButtons(canvas, signaturePad);
            this.setupValidation(canvas, signaturePad);
        });
    }

    setupCanvas(canvas, signaturePad) {
        const resizeCanvas = () => {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const context = canvas.getContext("2d");
            
            // Save the current signature data
            const signatureData = signaturePad.toData();
            
            // Set canvas dimensions
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            
            // Scale context
            context.scale(ratio, ratio);
            
            // Clear and restore signature if existed
            signaturePad.clear();
            if (signatureData && signatureData.length > 0) {
                signaturePad.fromData(signatureData);
            }
        };

        // Initial resize
        resizeCanvas();
        
        // Handle window resize
        window.addEventListener("resize", resizeCanvas);
        
        // Handle orientation change for mobile devices
        window.addEventListener("orientationchange", () => {
            setTimeout(resizeCanvas, 100);
        });
    }

    setupButtons(canvas, signaturePad) {
        // Clear button
        const clearBtn = document.querySelector(`[data-clear-for="${canvas.id}"]`);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                signaturePad.clear();
                this.updateHiddenInput(canvas.id, '');
                this.validateSignature(canvas.id, signaturePad);
            });
        }

        // Copy button
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
                        this.validateSignature(canvas.id, signaturePad);
                    };
                    image.src = previousSignature;
                } else {
                    alert('לא נמצאה חתימה קודמת');
                }
            });
        }

        // Save signature on end stroke
        signaturePad.addEventListener("endStroke", () => {
            if (!signaturePad.isEmpty()) {
                const signatureData = signaturePad.toDataURL('image/png');
                localStorage.setItem('signature', signatureData);
                this.updateHiddenInput(canvas.id, signatureData);
                this.validateSignature(canvas.id, signaturePad);
            }
        });
    }

    setupValidation(canvas, signaturePad) {
        // Add validation class to canvas container
        const container = canvas.closest('.signature-container');
        if (container) {
            container.classList.add('signature-validation');
        }

        // Initial validation
        this.validateSignature(canvas.id, signaturePad);
    }

    validateSignature(canvasId, signaturePad) {
        const container = document.getElementById(canvasId).closest('.signature-container');
        const input = document.getElementById(`${canvasId}-data`);
        
        if (!signaturePad.isEmpty()) {
            container.classList.add('is-valid');
            container.classList.remove('is-invalid');
            input.setCustomValidity('');
        } else {
            container.classList.remove('is-valid');
            container.classList.add('is-invalid');
            input.setCustomValidity('נדרשת חתימה');
        }
    }

    updateHiddenInput(canvasId, value) {
        const input = document.getElementById(`${canvasId}-data`);
        if (input) {
            input.value = value;
            // Trigger validation
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.signatureHandler = new SignatureHandler();
});
