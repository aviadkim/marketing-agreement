// Constants
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2Cu2YDQwHz5acvMFx7GzN9ht2BiuQkRI459f7_75y96Hh2BAUMimYl3e2XYEr_uhh/exec';

// Helper function to capture form screenshot
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

// Process and format form data
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
        riskAcknowledgement: formData.riskAcknowledgement === 'on' ? 'כן' : 'לא',
        independentDecision: formData.independentDecision === 'on' ? 'כן' : 'לא',
        updateCommitment: formData.updateCommitment === 'on' ? 'כן' : 'לא',

        // Additional data
        signature: formData.signature || '',
        formScreenshot: await captureFormScreenshot(),
        submissionDate: new Date().toISOString()
    };
}

// Validate form data
function validateFormData(formData) {
    const requiredFields = ['firstName', 'lastName', 'idNumber', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    if (!formData.signature) {
        throw new Error('חתימה נדרשת');
    }

    return true;
}

// Main submit function
async function submitFormToGoogleSheets() {
    try {
        // Process form data
        const formData = await processFormData();
        console.log('Processing form data:', formData);

        // Validate form data
        validateFormData(formData);

        // Submit to server
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

        return true;

    } catch (error) {
        console.error('Form submission error:', error);
        throw error;
    }
}

// Show message utility
function showMessage(message, type = 'error') {
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
        background: ${type === 'success' ? '#4CAF50' : '#dc3545'};
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
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
