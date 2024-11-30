const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2Cu2YDQwHz5acvMFx7GzN9ht2BiuQkRI459f7_75y96Hh2BAUMimYl3e2XYEr_uhh/exec';

async function addRowToGoogleSheet(formData) {
    try {
        // Capture form screenshot
        const formScreenshot = await captureForm();
        
        // Prepare data for sending
        const dataToSend = {
            // Personal Details (Section 1)
            firstName: formData.firstName || '',
            lastName: formData.lastName || '',
            idNumber: formData.idNumber || '',
            email: formData.email || '',
            phone: formData.phone || '',
            
            // Investment Details (Section 2)
            investmentAmount: formData.investmentAmount || '',
            bank: formData.bank || '',
            currency: formData.currency || '',
            purpose: Array.isArray(formData.purpose) ? formData.purpose.join(', ') : formData.purpose || '',
            purposeOther: formData.purposeOther || '',
            timeline: formData.timeline || '',
            
            // Risk Assessment (Section 3)
            marketExperience: Array.isArray(formData.marketExperience) ? 
                formData.marketExperience.join(', ') : formData.marketExperience || '',
            riskTolerance: formData.riskTolerance || '',
            lossResponse: formData.lossResponse || '',
            investmentKnowledge: Array.isArray(formData.investmentKnowledge) ? 
                formData.investmentKnowledge.join(', ') : formData.investmentKnowledge || '',
            investmentRestrictions: formData.investmentRestrictions || '',
            
            // Declarations (Section 4)
            riskAcknowledgement: formData.riskAcknowledgement ? 'כן' : 'לא',
            independentDecision: formData.independentDecision ? 'כן' : 'לא',
            updateCommitment: formData.updateCommitment ? 'כן' : 'לא',
            
            // Signature and Screenshots
            signature: formData.signature || '',
            formScreenshot: formScreenshot || '',
            submissionDate: new Date().toISOString()
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });
        
        return true;
    } catch (error) {
        console.error('Error sending to Google Sheets:', error);
        throw error;
    }
}

// Function to capture form
async function captureForm() {
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

module.exports = { addRowToGoogleSheet };
