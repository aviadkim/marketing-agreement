// Constants
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzOmHCbWzHu3mgRarwVPeJGI1jHhYHlRLVq2tTMEG8/dev';
const STORAGE_KEY = 'formData';

class FormHandler {
    constructor() {
        // Check if SignaturePad is loaded
        if (typeof SignaturePad === 'undefined') {
            console.error('SignaturePad is not loaded');
            return;
        }
        this.signatures = new Map();
        this.initialize();
    }

    initialize() {
        try {
            // Initialize signature pad on all canvases
            document.querySelectorAll('.signature-canvas').forEach(canvas => {
                if (!canvas) return;
                
                const signaturePad = new SignaturePad(canvas, {
                    backgroundColor: 'white',
                    penColor: 'black',
                    minWidth: 1,
                    maxWidth: 2.5
                });

                // Resize canvas
                this.resizeCanvas(canvas, signaturePad);
                window.addEventListener('resize', () => this.resizeCanvas(canvas, signaturePad));

                // Store signature pad instance
                this.signatures.set(canvas.id, signaturePad);

                // Setup signature events
                this.setupSignatureEvents(canvas, signaturePad);

                // Add clear button listener
                const clearBtn = document.querySelector(`[data-clear-for="${canvas.id}"]`);
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => this.clearSignature(canvas.id));
                }

                // Add copy button listener
                const copyBtn = document.querySelector(`[data-copy-for="${canvas.id}"]`);
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => this.copyPreviousSignature(canvas.id));
                }
            });

            // Add form submit listener
            const form = document.querySelector('form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleSubmit(e));
            }

            // Load saved data if exists
            this.loadSavedData();

        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    setupSignatureEvents(canvas, signaturePad) {
        signaturePad.addEventListener("beginStroke", () => {
            const container = canvas.closest('.signature-container');
            if (container) {
                container.classList.add('signature-active');
            }
        });

        signaturePad.addEventListener("endStroke", () => {
            if (!signaturePad.isEmpty()) {
                const signatureData = signaturePad.toDataURL();
                this.updateHiddenInput(canvas.id, signatureData);
                localStorage.setItem('signature', signatureData);
                
                const container = canvas.closest('.signature-container');
                if (container) {
                    container.classList.remove('signature-active');
                    container.classList.add('signature-valid');
                }
            }
            this.updateFormValidation();
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

    resizeCanvas(canvas, signaturePad) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const context = canvas.getContext("2d");
        
        // Save current data
        const data = signaturePad.toData();
        
        // Resize
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        context.scale(ratio, ratio);
        
        // Restore data
        signaturePad.clear();
        if (data) {
            signaturePad.fromData(data);
        }
    }

    clearSignature(canvasId) {
        const signaturePad = this.signatures.get(canvasId);
        if (signaturePad) {
            signaturePad.clear();
            this.updateHiddenInput(canvasId, '');
            
            const container = document.querySelector(`#${canvasId}`).closest('.signature-container');
            if (container) {
                container.classList.remove('signature-valid', 'signature-active');
            }
            
            this.updateFormValidation();
        }
    }

    copyPreviousSignature(canvasId) {
        const signaturePad = this.signatures.get(canvasId);
        const previousSignature = localStorage.getItem('signature');
        
        if (signaturePad && previousSignature) {
            const image = new Image();
            image.onload = () => {
                signaturePad.clear();
                const canvas = document.getElementById(canvasId);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                this.updateHiddenInput(canvasId, previousSignature);
                
                const container = canvas.closest('.signature-container');
                if (container) {
                    container.classList.add('signature-valid');
                }
                
                this.updateFormValidation();
            };
            image.src = previousSignature;
        } else {
            this.showMessage('לא נמצאה חתימה קודמת', 'error');
        }
    }

    async captureScreenshot() {
        try {
            const formElement = document.querySelector('.form-content');
            if (!formElement) return null;
            
            const canvas = await html2canvas(formElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            return null;
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const processedData = this.processFormData(formData);
            
            // Add signatures
            this.signatures.forEach((signaturePad, canvasId) => {
                if (!signaturePad.isEmpty()) {
                    processedData[canvasId] = signaturePad.toDataURL();
                    localStorage.setItem('signature', signaturePad.toDataURL());
                }
            });

            // Add screenshot
            processedData.formScreenshot = await this.captureScreenshot();

            // Submit to Google Sheets
            await this.submitToGoogleSheets(processedData);
            
            this.showMessage('הטופס נשלח בהצלחה!', 'success');
            this.clearStoredData();
            
            // Redirect to thank you page
            setTimeout(() => {
                window.location.href = '/thank-you.html';
            }, 1500);

        } catch (error) {
            console.error('Submit error:', error);
            this.showMessage('אירעה שגיאה בשליחת הטופס', 'error');
        }
    }

    async submitToGoogleSheets(data) {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok && response.status !== 0) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    processFormData(formData) {
        const processed = {};
        for (const [key, value] of formData.entries()) {
            if (processed[key]) {
                if (!Array.isArray(processed[key])) {
                    processed[key] = [processed[key]];
                }
                processed[key].push(value);
            } else {
                processed[key] = value;
            }
        }
        return processed;
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    updateFormValidation() {
        const submitButton = document.querySelector('[type="submit"]');
        if (!submitButton) return;

        const isValid = Array.from(this.signatures.values()).some(pad => !pad.isEmpty());
        submitButton.disabled = !isValid;
    }

    loadSavedData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                const form = document.querySelector('form');
                if (form) {
                    Object.entries(data).forEach(([key, value]) => {
                        const input = form.querySelector(`[name="${key}"]`);
                        if (input) {
                            input.value = value;
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    clearStoredData() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('signature');
    }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
});
