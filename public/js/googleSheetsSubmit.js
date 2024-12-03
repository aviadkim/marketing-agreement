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

async function processFormData() {
    const formData = {};
    
    // Collect data from all sections
    for (let i = 1; i <= 4; i++) {
        const sectionData = localStorage.getItem(`section${i}Data`);
        if (sectionData) {
            Object.assign(formData, JSON.parse(sectionData));
        }
    }

    return {
        // Your existing formData structure...
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        idNumber: formData.idNumber || '',
        email: formData.email || '',
        phone: formData.phone || '',
        investmentAmount: formData.investmentAmount || '',
        bank: formData.bank || '',
        currency: formData.currency || '',
        purpose: Array.isArray(formData.purpose) ? formData.purpose.join(', ') : formData.purpose || '',
        purposeOther: formData.purposeOther || '',
        timeline: formData.timeline || '',
        marketExperience: Array.isArray(formData.marketExperience) ? 
            formData.marketExperience.join(', ') : formData.marketExperience || '',
        riskTolerance: formData.riskTolerance || '',
        lossResponse: formData.lossResponse || '',
        investmentKnowledge: Array.isArray(formData.investmentKnowledge) ? 
            formData.investmentKnowledge.join(', ') : formData.investmentKnowledge || '',
        investmentRestrictions: formData.investmentRestrictions || '',
        riskAcknowledgement: formData.riskAcknowledgement === 'on' ? 'כן' : 'לא',
        independentDecision: formData.independentDecision === 'on' ? 'כן' : 'לא',
        updateCommitment: formData.updateCommitment === 'on' ? 'כן' : 'לא',
        signature: formData.signature || '',
        formScreenshot: await captureFormScreenshot(),
        submissionDate: new Date().toISOString()
    };
}

async function submitFormToGoogleSheets() {
    try {
        const formData = await processFormData();
        console.log('Submitting data:', formData);

        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (!response.ok || data.error) {
            throw new Error(data.message || 'שגיאה בשליחת הנתונים');
        }

        // Clear storage after successful submission
        for (let i = 1; i <= 4; i++) {
            localStorage.removeItem(`section${i}Data`);
        }
        localStorage.removeItem('lastSignature');

        return true;
    } catch (error) {
        console.error('Submission error:', error);
        alert(error.message || 'שגיאה בשליחת הטופס');
        return false;
    }
}

// Make the function available globally
window.submitFormToGoogleSheets = submitFormToGoogleSheets;
