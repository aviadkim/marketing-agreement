class SignatureHandler {
    constructor() {
        this.initialize();
    }

    initialize() {
        const canvas = document.getElementById('signatureCanvas1');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        try {
            this.signaturePad = new SignaturePad(canvas, {
                minWidth: 1,
                maxWidth: 2.5,
                throttle: 16,
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });

            console.log('SignaturePad initialized successfully');
            this.setupCanvas(canvas);
            this.setupButtons(canvas);
            this.attachEvents(canvas);

        } catch (error) {
            console.error('Error initializing SignaturePad:', error);
        }
    }

    setupCanvas(canvas) {
        const resizeCanvas = () => {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const context = canvas.getContext("2d");
            
            // שמירת הנתונים הנוכחיים
            const data = this.signaturePad.toData();
            
            // עדכון גודל
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            context.scale(ratio, ratio);
            
            // שחזור הנתונים
            this.signaturePad.clear();
            if (data) {
                this.signaturePad.fromData(data);
            }
        };

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("orientationchange", () => {
            setTimeout(resizeCanvas, 100);
        });
        resizeCanvas();
    }

    setupButtons(canvas) {
        const clearButton = document.querySelector(`[data-clear-for="${canvas.id}"]`);
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.signaturePad.clear();
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
                        this.signaturePad.clear();
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

    attachEvents(canvas) {
        this.signaturePad.addEventListener("beginStroke", () => {
            const container = canvas.closest('.signature-container');
            if (container) {
                container.classList.add('signature-active');
            }
        });

        this.signaturePad.addEventListener("endStroke", () => {
            if (!this.signaturePad.isEmpty()) {
                const signatureData = this.signaturePad.toDataURL('image/png');
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
