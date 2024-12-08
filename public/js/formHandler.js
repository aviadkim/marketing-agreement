// public/js/formSubmission.js

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

class FormSubmissionHandler {
    constructor() {
        this.initialize();
    }

    initialize() {
        const form = document.getElementById('section4-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const submitButton = document.getElementById('finalSubmit');
        if (submitButton) {
            submitButton.addEventListener('click', (e) => this.handleSubmitClick(e));
        }
    }

    async handleSubmitClick(e) {
        e.preventDefault();
        const form = document.getElementById('section4-form');
        if (form) {
            this.handleSubmit({ preventDefault: () => {}, target: form });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        try {
            const formData = new FormData(e.target);
            const data = await this.processFormData(formData);
            const success = await this.submitToGoogleSheets(data);

            if (success) {
                this.showSuccessMessage();
                // ניקוי נתונים מקומיים
                localStorage.removeItem('formData');
                localStorage.removeItem('signature');
                
                // הפניה לדף תודה
                setTimeout(() => {
                    window.location.href = '/thank-you.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.showErrorMessage();
        }
    }

    async processFormData(formData) {
        const processedData = {
            submissionDate: new Date().toISOString(),
            ...Array.from(formData.entries()).reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {})
        };

        // הוספת צילום מסך של הטופס
        const screenshot = await this.captureFormScreenshot();
        if (screenshot) {
            processedData.formScreenshot = screenshot;
        }

        return processedData;
    }

    async captureFormScreenshot() {
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

    async submitToGoogleSheets(data) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            return true;
        } catch (error) {
            console.error('Error submitting to Google Sheets:', error);
            throw error;
        }
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'message success';
        message.textContent = 'הטופס נשלח בהצלחה!';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }

    showErrorMessage() {
        const message = document.createElement('div');
        message.className = 'message error';
        message.textContent = 'אירעה שגיאה בשליחת הטופס';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formSubmissionHandler = new FormSubmissionHandler();
});
