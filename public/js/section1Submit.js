const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwf-7F8NIXbcDGTCKsx_5eCfxv9BTgGkSTYKMfWbCQNm37Rab2HA70gt8MkiXZWd6Ps/exec';

// Helper Functions
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

async function captureFormScreenshot() {
    try {
        console.log('Starting screenshot capture...');
        const formElement = document.querySelector('.form-content');
        if (!formElement) {
            console.error('Form element not found');
            return null;
        }
        
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true
        });
        console.log('Screenshot captured successfully');
        return canvas.toDataURL('image/png', 0.8);
    } catch (error) {
        console.error('Screenshot capture error:', error);
        return null;
    }
}

async function submitSection1() {
    try {
        console.log('Starting section 1 submission...');
        const form = document.getElementById('section1-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const submitButton = document.getElementById('saveAndContinue');
        submitButton.disabled = true;
        showMessage('מעבד את הטופס...', 'info');

        // Capture form data
        const formData = new FormData(form);
        console.log('Form data collected:', Object.fromEntries(formData));

        // Capture screenshot
        const screenshot = await captureFormScreenshot();
        if (!screenshot) {
            throw new Error('Failed to capture form screenshot');
        }

        const processedData = {
            section: '1',
            timestamp: new Date().toISOString(),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            formScreenshot: screenshot,
            downloadUrl: `${window.location.origin}/form/section1_${Date.now()}_${formData.get('idNumber')}`
        };

        console.log('Submitting to Google Sheets:', {
            ...processedData,
            formScreenshot: '[SCREENSHOT DATA HIDDEN]'
        });

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData)
        });

        console.log('Response received');

        // Store data for later combination
        localStorage.setItem('section1Data', JSON.stringify({
            ...processedData,
            formScreenshot: screenshot
        }));

        showMessage('הטופס נשלח בהצלחה', 'success');

        // Allow navigation to handle the redirect
        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 1000);

        return true;
    } catch (error) {
        console.error('Submission error:', error);
        showMessage('שגיאה בשליחת הטופס', 'error');
        
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = false;
        }
        return false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing section 1...');
    const form = document.getElementById('section1-form');
    const submitButton = document.getElementById('saveAndContinue');

    if (!form || !submitButton) {
        console.error('Required elements not found');
        return;
    }

    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigation.js from handling this
        await submitSection1();
    });
});

// Export functions
window.submitSection1 = submitSection1;
window.showMessage = showMessage;
