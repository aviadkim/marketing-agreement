const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKIS5nbJFMOCgLNZEsIFm0eWuGqkWb8v-1CqjAqHiM8iZ3VTrnKakaOg3PPjCiwOAM/exec';

// Helper function to capture single page screenshot
async function capturePageScreenshot() {
    try {
        const formElement = document.querySelector('.form-content');
        if (!formElement) return null;
        
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true,
            width: formElement.offsetWidth,
            height: formElement.offsetHeight * 1.5
        });
        return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
        console.error('Error capturing page:', error);
        return null;
    }
}

// Helper function to capture all pages
async function captureAllPages() {
    const pages = [];
    
    for (let i = 1; i <= 4; i++) {
        try {
            const response = await fetch(`/sections/section${i}.html`);
            const html = await response.text();
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv);
            
            const formContent = tempDiv.querySelector('.form-content');
            if (formContent) {
                const canvas = await html2canvas(formContent, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: true,
                    width: formContent.offsetWidth,
                    height: formContent.offsetHeight * 1.5
                });
                pages.push(canvas.toDataURL('image/png', 1.0));
            }
            
            document.body.removeChild(tempDiv);
            
            // Add delay between captures
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`Error capturing section ${i}:`, error);
        }
    }
    
    return pages;
}

// Create PDF from captured pages
async function createPDF(pages) {
    if (!window.jspdf) {
        console.error('jsPDF library not loaded');
        return null;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) {
                doc.addPage();
            }
            
            const imgProps = doc.getImageProperties(pages[i]);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            doc.addImage(pages[i], 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        
        return doc.output('datauristring');
    } catch (error) {
        console.error('Error creating PDF:', error);
        return null;
    }
}

// Process and format form data
async function processFormData() {
    const formData = {};
    
    // Collect data from all sections
    for (let i = 1; i <= 4; i++) {
        const sectionData = localStorage.getItem(`section${i}Data`);
        if (sectionData) {
            try {
                Object.assign(formData, JSON.parse(sectionData));
            } catch (error) {
                console.error(`Error parsing section ${i} data:`, error);
            }
        }
    }

    // Process checkbox values
    ['riskAcknowledgement', 'independentDecision', 'updateCommitment'].forEach(field => {
        formData[field] = formData[field] === 'on' || formData[field] === true ? 'כן' : 'לא';
    });

    // Get signature data
    const signatureData = document.getElementById('signatureData')?.value || formData.signature || '';

    // Capture current page screenshot
    console.log('Capturing current page...');
    const currentPageScreenshot = await capturePageScreenshot();

    // Capture all pages and create PDF
    console.log('Capturing all pages...');
    const pages = await captureAllPages();
    console.log('Pages captured:', pages.length);
    
    const pdfData = await createPDF(pages);
    console.log('PDF created:', pdfData ? 'success' : 'failed');

    return {
        // Section 1
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        idNumber: formData.idNumber || '',
        email: formData.email || '',
        phone: formData.phone || '',

        // Section 2
        investmentAmount: formData.investmentAmount || '',
        bank: formData.bank || '',
        currency: formData.currency || '',
        purpose: Array.isArray(formData.purpose) ? formData.purpose.join(', ') : formData.purpose || '',
        purposeOther: formData.purposeOther || '',
        timeline: formData.timeline || '',

        // Section 3
        marketExperience: Array.isArray(formData.marketExperience) ? 
            formData.marketExperience.join(', ') : formData.marketExperience || '',
        riskTolerance: formData.riskTolerance || '',
        lossResponse: formData.lossResponse || '',
        investmentKnowledge: Array.isArray(formData.investmentKnowledge) ? 
            formData.investmentKnowledge.join(', ') : formData.investmentKnowledge || '',
        investmentRestrictions: formData.investmentRestrictions || '',

        // Section 4
        riskAcknowledgement: formData.riskAcknowledgement || 'לא',
        independentDecision: formData.independentDecision || 'לא',
        updateCommitment: formData.updateCommitment || 'לא',

        // Additional data
        signature: signatureData,
        currentPageScreenshot: currentPageScreenshot,
        formPDF: pdfData,
        submissionDate: new Date().toISOString()
    };
}

// Validate form data
function validateFormData(formData) {
    const requiredFields = ['firstName', 'lastName', 'idNumber', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`חסרים שדות חובה: ${missingFields.join(', ')}`);
    }
    
    if (!formData.signature) {
        throw new Error('חתימה נדרשת');
    }

    return true;
}

// Main submit function
async function submitFormToGoogleSheets() {
    try {
        // Show loading message
        showMessage('מעבד את הטופס...', 'info');
        
        // Process form data
        const formData = await processFormData();
        console.log('Processing form data:', { 
            ...formData, 
            signature: '[HIDDEN]', 
            currentPageScreenshot: '[HIDDEN]',
            formPDF: formData.formPDF ? '[PDF DATA]' : 'null' 
        });

        // Validate form data
        validateFormData(formData);

        // Show sending message
        showMessage('שולח את הטופס...', 'info');

        // Submit to server
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        showMessage('הטופס נשלח בהצלחה', 'success');
        return true;

    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        throw error;
    }
}

// Show message utility
function showMessage(message, type = 'error') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = message;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        color: white;
        background: ${
            type === 'success' ? '#4CAF50' : 
            type === 'info' ? '#2196F3' : 
            '#dc3545'
        };
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    
    if (type !== 'info') {
        setTimeout(() => div.remove(), 3000);
    }
}

// Clear form data
function clearFormData() {
    for (let i = 1; i <= 4; i++) {
        localStorage.removeItem(`section${i}Data`);
    }
    localStorage.removeItem('lastSignature');
}

// Make functions available globally
window.submitFormToGoogleSheets = submitFormToGoogleSheets;
window.showMessage = showMessage;
window.clearFormData = clearFormData;

// Initialize html2canvas
document.addEventListener('DOMContentLoaded', () => {
    if (window.html2canvas) {
        html2canvas.init({
            logging: true,
            useCORS: true,
            allowTaint: true,
            scale: 2,
            backgroundColor: '#ffffff'
        });
    }
});
