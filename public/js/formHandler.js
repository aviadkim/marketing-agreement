// Constants
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzOmHCbWzHu3mgRarwVPeJGI1jHhYHlRLVq2tTMEG8/dev';
const STORAGE_KEY = 'formData';

class FormHandler {
    constructor() {
        this.signatures = new Map();
        this.initialize();
    }

    initialize() {
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
    }

    resizeCanvas(canvas, signaturePad) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }

    clearSignature(canvasId) {
        const signaturePad = this.signatures.get(canvasId);
        if (signaturePad) {
            signaturePad.clear();
            this.updateFormValidation();
        }
    }

    copyPreviousSignature(canvasId) {
        const signaturePad = this.signatures.get(canvasId);
        const previousSignature = localStorage.getItem('signature');
        
        if (signaturePad && previousSignature) {
            signaturePad.fromDataURL(previousSignature);
            this.updateFormValidation();
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
                    // Save last signature for future use
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

        if (!response.ok && response.status !== 0) { // status 0 is expected with no-cors
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

    clearStoredData() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('signature');
    }
}

// Initialize form handler
document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
});

export { FormHandler };