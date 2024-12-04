const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKIS5nbJFMOCgLNZEsIFm0eWuGqkWb8v-1CqjAqHiM8iZ3VTrnKakaOg3PPjCiwOAM/exec';

// Function to capture form screenshot
async function captureFormScreenshot() {
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
        console.error('Error capturing form:', error);
        return null;
    }
}

// Function to process form data
function processFormData(formData) {
    return {
        // Section 1 - Personal Details
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        idNumber: formData.idNumber || '',
        email: formData.email || '',
        phone: formData.phone || '',
        
        // Section 2 - Investment Details
        investmentAmount: formData.investmentAmount || '',
        bank: formData.bank || '',
        currency: formData.currency || '',
        purpose: Array.isArray(formData.purpose) ? formData.purpose.join(', ') : formData.purpose || '',
        purposeOther: formData.purposeOther || '',
        timeline: formData.timeline || '',
        
        // Section 3 - Risk Assessment
        marketExperience: Array.isArray(formData.marketExperience) ? 
            formData.marketExperience.join(', ') : formData.marketExperience || '',
        riskTolerance: formData.riskTolerance || '',
        lossResponse: formData.lossResponse || '',
        investmentKnowledge: Array.isArray(formData.investmentKnowledge) ? 
            formData.investmentKnowledge.join(', ') : formData.investmentKnowledge || '',
        investmentRestrictions: formData.investmentRestrictions || '',
        
        // Section 4 - Declarations
        riskAcknowledgement: formData.riskAcknowledgement ? 'כן' : 'לא',
        independentDecision: formData.independentDecision ? 'כן' : 'לא',
        updateCommitment: formData.updateCommitment ? 'כן' : 'לא',
        
        // Additional Data
        submissionDate: new Date().toISOString(),
        signature: formData.signature || ''
    };
}

// Main submit function
async function submitFormToGoogleSheets(formData) {
    try {
        // Process form data
        const processedData = processFormData(formData);
        
        // Add screenshot if possible
        processedData.formScreenshot = await captureFormScreenshot();
        
        // Send to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData)
        });
        
        return true;
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        throw error;
    }
}

// Export functions
export { submitFormToGoogleSheets };
