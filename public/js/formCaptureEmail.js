// formCaptureEmail.js

class EmailCaptureService {
    constructor() {
        this.screenshots = {};
        this.formData = {};
        // Replace with your email service endpoint
        this.EMAIL_API = '/api/send-form-email';
    }

    async captureCurrentSection(sectionNumber) {
        try {
            const formElement = document.querySelector('.form-content');
            if (!formElement) return null;

            // Capture screenshot
            const canvas = await html2canvas(formElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Convert to base64
            const screenshot = canvas.toDataURL('image/jpeg', 0.8);
            
            // Store in memory
            this.screenshots[`section${sectionNumber}`] = screenshot;
            
            // Store form data
            this.formData[`section${sectionNumber}`] = localStorage.getItem(`section${sectionNumber}Data`);

            return true;
        } catch (error) {
            console.error('Error capturing section:', error);
            return false;
        }
    }

    async sendEmail(recipientEmail) {
        try {
            // Create PDF with all screenshots
            const pdf = new jsPDF();
            Object.entries(this.screenshots).forEach(([section, screenshot], index) => {
                if (index > 0) pdf.addPage();
                pdf.addImage(screenshot, 'JPEG', 0, 0, 210, 297);
            });

            // Prepare email data
            const emailData = {
                to: recipientEmail,
                subject: 'Form Submission with Screenshots',
                attachments: [
                    {
                        filename: 'form-screenshots.pdf',
                        content: pdf.output('datauristring')
                    }
                ],
                formData: this.formData,
                timestamp: new Date().toISOString()
            };

            // Send email
            const response = await fetch(this.EMAIL_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) throw new Error('Email send failed');

            return await response.json();
        } catch (error) {
            console.error('Email send error:', error);
            throw error;
        }
    }
}

// Initialize and export service
const emailCaptureService = new EmailCaptureService();
window.emailCaptureService = emailCaptureService;
