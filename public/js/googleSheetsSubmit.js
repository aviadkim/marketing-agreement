// googleSheetsSubmit.js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKIS5nbJFMOCgLNZEsIFm0eWuGqkWb8v-1CqjAqHiM8iZ3VTrnKakaOg3PPjCiwOAM/exec';

function generateDownloadUrl(formData) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}_${formData.idNumber}`;
    return `${window.location.origin}/form/${uniqueId}`;
}

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

async function submitSection1() {
    try {
        showMessage('מעבד את הטופס...', 'info');
        
        const form = document.getElementById('section1-form');
        const formData = new FormData(form);
        
        // Process section 1 data
        const processedData = {
            section: '1',
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            timestamp: new Date().toISOString()
        };

        // Capture screenshot
        console.log('Capturing form screenshot...');
        const screenshot = await captureFormScreenshot();
        if (screenshot) {
            processedData.formScreenshot = screenshot;
        }

        // Generate download URL
        processedData.downloadUrl = generateDownloadUrl(processedData);

        // Save to localStorage
        localStorage.setItem('section1Data', JSON.stringify(processedData));

        console.log('Submitting to Google Sheets:', {
            ...processedData,
            formScreenshot: '[SCREENSHOT DATA]'
        });

        // Submit to Google Sheets
        showMessage('שולח את הטופס...', 'info');
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData)
        });

        showMessage('הטופס נשלח בהצלחה', 'success');
        
        // Navigate to section 2
        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 1000);

        return true;
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        throw error;
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

// Export functions
window.submitSection1 = submitSection1;
window.showMessage = showMessage;

document.addEventListener('DOMContentLoaded', () => {
    // Set up event listener for form submission
    const continueButton = document.getElementById('saveAndContinue');
    if (continueButton) {
        continueButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const form = document.getElementById('section1-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            try {
                continueButton.disabled = true;
                await submitSection1();
            } catch (error) {
                continueButton.disabled = false;
            }
        });
    }
});
