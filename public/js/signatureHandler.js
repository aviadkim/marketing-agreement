// signatureHandler.js
class SignatureHandler {
    constructor() {
        console.log('SignatureHandler initialized'); // Debug log
        this.initialize();
    }

    initialize() {
        console.log('Starting initialization'); // Debug log
        const canvases = document.querySelectorAll('.signature-canvas');
        console.log('Found canvases:', canvases.length); // Debug log

        canvases.forEach((canvas, index) => {
            if (!canvas) return;
            console.log(`Initializing canvas ${index}:`, canvas.id); // Debug log
            
            try {
                const signaturePad = new SignaturePad(canvas, {
                    minWidth: 1,
                    maxWidth: 2.5,
                    throttle: 16,
                    backgroundColor: 'rgb(255, 255, 255)',
                    penColor: 'rgb(0, 0, 0)'
                });
                console.log('SignaturePad created successfully for', canvas.id); // Debug log

                this.setupCanvas(canvas, signaturePad);
                this.setupButtons(canvas, signaturePad);
                this.setupValidation(canvas, signaturePad);

                // Test if the pad is responding
                signaturePad.addEventListener("beginStroke", () => {
                    console.log('Stroke began on', canvas.id); // Debug log
                });

                signaturePad.addEventListener("endStroke", () => {
                    console.log('Stroke ended on', canvas.id); // Debug log
                    const data = signaturePad.toDataURL();
                    console.log('Signature data length:', data.length); // Debug log
                    this.updateHiddenInput(canvas.id, data);
                });
            } catch (error) {
                console.error('Error initializing SignaturePad:', error); // Debug log
            }
        });
    }

    setupCanvas(canvas, signaturePad) {
        console.log('Setting up canvas:', canvas.id); // Debug log
        const resizeCanvas = () => {
            console.log('Resizing canvas:', canvas.id); // Debug log
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const context = canvas.getContext("2d");
            
            // Save current dimensions
            console.log('Original dimensions:', {
                width: canvas.width,
                height: canvas.height,
                offsetWidth: canvas.offsetWidth,
                offsetHeight: canvas.offsetHeight
            }); // Debug log
            
            const signatureData = signaturePad.toData();
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            context.scale(ratio, ratio);
            
            console.log('New dimensions:', {
                width: canvas.width,
                height: canvas.height
            }); // Debug log

            signaturePad.clear();
            if (signatureData && signatureData.length > 0) {
                signaturePad.fromData(signatureData);
            }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
    }

    setupValidation(canvas, signaturePad) {
        console.log('Setting up validation for:', canvas.id); // Debug log
        const container = canvas.closest('.signature-container');
        if (container) {
            container.classList.add('signature-validation');
            console.log('Added validation class to container'); // Debug log
        } else {
            console.warn('Could not find signature container'); // Debug log
        }
        this.validateSignature(canvas.id, signaturePad);
    }

    validateSignature(canvasId, signaturePad) {
        console.log('Validating signature for:', canvasId); // Debug log
        const container = document.getElementById(canvasId).closest('.signature-container');
        const input = document.getElementById(`${canvasId}-data`);
        
        if (!signaturePad.isEmpty()) {
            console.log('Signature is valid'); // Debug log
            container.classList.add('is-valid');
            container.classList.remove('is-invalid');
            input.setCustomValidity('');
        } else {
            console.log('Signature is invalid/empty'); // Debug log
            container.classList.remove('is-valid');
            container.classList.add('is-invalid');
            input.setCustomValidity('נדרשת חתימה');
        }
    }

    updateHiddenInput(canvasId, value) {
        console.log('Updating hidden input for:', canvasId); // Debug log
        const input = document.getElementById(`${canvasId}-data`);
        if (input) {
            input.value = value;
            console.log('Hidden input updated, length:', value.length); // Debug log
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        } else {
            console.warn('Could not find hidden input:', `${canvasId}-data`); // Debug log
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SignatureHandler'); // Debug log
    window.signatureHandler = new SignatureHandler();
});
