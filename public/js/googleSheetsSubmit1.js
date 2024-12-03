const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzOmHCbWzHu3mgRarwVPeJGI1jHhYHlRLVq2tTMEG8/dev';

async function submitFormToGoogleSheets(formData) {
    try {
        // Capture form screenshot
        const formElement = document.querySelector('.form-content');
        const screenshot = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        const data = {
            firstName: localStorage.getItem('firstName'),
            lastName: localStorage.getItem('lastName'),
            idNumber: localStorage.getItem('idNumber'),
            email: localStorage.getItem('email'),
            phone: localStorage.getItem('phone'),
            investmentAmount: localStorage.getItem('investmentAmount'),
            bank: localStorage.getItem('bank'),
            currency: localStorage.getItem('currency'),
            purpose: localStorage.getItem('purpose'),
            timeline: localStorage.getItem('timeline'),
            marketExperience: localStorage.getItem('marketExperience'),
            riskTolerance: localStorage.getItem('riskTolerance'),
            lossResponse: localStorage.getItem('lossResponse'),
            investmentKnowledge: localStorage.getItem('investmentKnowledge'),
            investmentRestrictions: localStorage.getItem('investmentRestrictions'),
            riskAcknowledgement: formData.get('riskAcknowledgement') === 'on',
            independentDecision: formData.get('independentDecision') === 'on',
            updateCommitment: formData.get('updateCommitment') === 'on',
            signature: document.getElementById('signatureData').value,
            formScreenshot: screenshot.toDataURL('image/png')
        };

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
        console.error('Error:', error);
        throw error;
    }
}

window.submitFormToGoogleSheets = submitFormToGoogleSheets;
