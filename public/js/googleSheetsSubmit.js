const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2Cu2YDQwHz5acvMFx7GzN9ht2BiuQkRI459f7_75y96Hh2BAUMimYl3e2XYEr_uhh/exec';

async function processFormData() {
    const allData = {};
    // Collect data from all sections
    for (let i = 1; i <= 4; i++) {
        const sectionData = localStorage.getItem(`section${i}Data`);
        if (sectionData) {
            Object.assign(allData, JSON.parse(sectionData));
        }
    }

    return {
        // Section 1
        firstName: allData.firstName || '',
        lastName: allData.lastName || '',
        idNumber: allData.idNumber || '',
        email: allData.email || '',
        phone: allData.phone || '',

        // Section 2
        investmentAmount: allData.investmentAmount || '',
        bank: allData.bank || '',
        currency: allData.currency || '',
        purpose: allData.purpose || '',
        timeline: allData.timeline || '',

        // Section 3
        marketExperience: Array.isArray(allData.marketExperience) ? 
            allData.marketExperience.join(', ') : allData.marketExperience || '',
        riskTolerance: allData.riskTolerance || '',
        lossResponse: allData.lossResponse || '',
        investmentKnowledge: Array.isArray(allData.investmentKnowledge) ? 
            allData.investmentKnowledge.join(', ') : allData.investmentKnowledge || '',
        investmentRestrictions: allData.investmentRestrictions || '',

        // Section 4
        riskAcknowledgement: allData.riskAcknowledgement === 'on',
        independentDecision: allData.independentDecision === 'on',
        updateCommitment: allData.updateCommitment === 'on',

        // Add signature if exists
        signature: document.getElementById('signatureData')?.value || '',
        
        // Add form screenshot
        formScreenshot: await captureFormScreenshot()
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
        
        if (!response.ok || data.result === 'error') {
            throw new Error(data.error || 'שגיאה בשליחת הנתונים');
        }

        // Clear storage and redirect on success
        for (let i = 1; i <= 4; i++) {
            localStorage.removeItem(`section${i}Data`);
        }
        localStorage.removeItem('lastSignature');
        
        window.location.href = '/sections/preview.html';
        return true;

    } catch (error) {
        console.error('Submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        return false;
    }
}

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
        console.error('Error capturing screenshot:', error);
        return null;
    }
}
