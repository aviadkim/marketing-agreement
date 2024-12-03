// Replace with your Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2Cu2YDQwHz5acvMFx7GzN9ht2BiuQkRI459f7_75y96Hh2BAUMimYl3e2XYEr_uhh/exec';

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

async function submitFormToGoogleSheets(formData) {
    try {
        const processedData = {
            // Section 1 - Personal Details
            firstName: formData.get('firstName') || '',
            lastName: formData.get('lastName') || '',
            idNumber: formData.get('idNumber') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            
            // Section 2 - Investment Details
            investmentAmount: formData.get('investmentAmount') || '',
            bank: formData.get('bank') || '',
            currency: formData.get('currency') || '',
            purpose: Array.from(formData.getAll('purpose')).join(', '),
            timeline: formData.get('timeline') || '',
            
            // Section 3 - Risk Assessment
            marketExperience: formData.get('marketExperience') || '',
            riskTolerance: formData.get('riskTolerance') || '',
            lossResponse: formData.get('lossResponse') || '',
            investmentKnowledge: formData.get('investmentKnowledge') || '',
            investmentRestrictions: formData.get('investmentRestrictions') || '',
            
            // Section 4 - Declarations
            riskAcknowledgement: formData.get('riskAcknowledgement') === 'on',
            independentDecision: formData.get('independentDecision') === 'on',
            updateCommitment: formData.get('updateCommitment') === 'on',
            
            // Signature and Screenshot
            signature: document.getElementById('signatureData').value || '',
            formScreenshot: await captureFormScreenshot()
        };

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

window.submitFormToGoogleSheets = submitFormToGoogleSheets;
