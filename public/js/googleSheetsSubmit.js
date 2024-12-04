// Import form capture functionality
import { captureFormAsImage } from './formCapture.js';

// Constants
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKIS5nbJFMOCgLNZEsIFm0eWuGqkWb8v-1CqjAqHiM8iZ3VTrnKakaOg3PPjCiwOAM/exec';

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
    
    // Capture form screenshot
    const screenshot = await captureFormAsImage();
    console.log('Form screenshot captured:', screenshot ? 'success' : 'failed');

    return {
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
        riskAcknowledgement: formData.riskAcknowledgement || 'לא',
        independentDecision: formData.independentDecision || 'לא',
        updateCommitment: formData.updateCommitment || 'לא',
        signature: signatureData,
        formScreenshot: screenshot,
        submissionDate: new Date().toISOString()
    };
}

// Main submit function
async function submitFormToGoogleSheets() {
    try {
        const formData = await processFormData();
        console.log('Processing form data:', formData);

        // Submit to server
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Form submitted successfully');
            showMessage('הטופס נשלח בהצלחה', 'success');
            return true;
        } else {
            throw new Error(result.message || 'שגיאה בשליחת הטופס');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
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
