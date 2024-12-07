const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKIS5nbJFMOCgLNZEsIFm0eWuGqkWb8v-1CqjAqHiM8iZ3VTrnKakaOg3PPjCiwOAM/exec';

async function captureFormScreenshot() {
    try {
        const formElement = document.querySelector('.form-content');
        if (!formElement) return null;
        
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true
        });
        return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
        console.error('Error capturing form:', error);
        return null;
    }
}

async function submitSection4() {
    try {
        const form = document.getElementById('section4-form');
        const signaturePad = window.signaturePad; // Get from global scope
        
        if (!form.checkValidity() || signaturePad.isEmpty()) {
            if (signaturePad.isEmpty()) {
                showMessage('נא להוסיף חתימה', 'error');
            } else {
                showMessage('נא למלא את כל השדות הנדרשים', 'error');
            }
            return false;
        }

        showMessage('מעבד את הטופס...', 'info');
        
        // Get form data
        const formData = new FormData(form);
        
        // Get signature
        const signatureData = signaturePad.toDataURL();
        
        // Capture form screenshot
        const screenshot = await captureFormScreenshot();

        // Process section 4 data
        const processedData = {
            section: '4',
            riskAcknowledgement: formData.get('riskAcknowledgement') === 'on',
            independentDecision: formData.get('independentDecision') === 'on',
            updateCommitment: formData.get('updateCommitment') === 'on',
            finalConfirmation: formData.get('finalConfirmation') === 'on',
            signature: signatureData,
            formScreenshot: screenshot,
            timestamp: new Date().toISOString(),
            downloadUrl: `${window.location.origin}/form/section4_${Date.now()}`
        };

        // Get data from previous sections
        const section1Data = JSON.parse(localStorage.getItem('section1Data') || '{}');
        const section2Data = JSON.parse(localStorage.getItem('section2Data') || '{}');
        const section3Data = JSON.parse(localStorage.getItem('section3Data') || '{}');

        // Combine all data for final submission
        const finalData = {
            ...section1Data,
            ...section2Data,
            ...section3Data,
            ...processedData,
            isComplete: true
        };

        // Submit to Google Sheets
        console.log('Submitting final form:', {
            ...finalData,
            formScreenshot: '[SCREENSHOT DATA]',
            signature: '[SIGNATURE DATA]'
        });

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalData)
        });

        // Save final data
        localStorage.setItem('section4Data', JSON.stringify(processedData));
        localStorage.setItem('finalFormData', JSON.stringify(finalData));

        showMessage('הטופס נשלח בהצלחה', 'success');
        
        // Navigate to thank you page
        setTimeout(() => {
            window.location.href = '/sections/thank-you.html';
        }, 1000);

        return true;
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        return false;
    }
}

function showMessage(message, type = 'error') {
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

// Export functions to window
window.submitSection4 = submitSection4;
window.showMessage = showMessage;
