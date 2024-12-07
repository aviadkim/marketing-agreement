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

function generateDownloadUrl(formData) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}_${formData.idNumber}`;
    return `${window.location.origin}/form/section1_${uniqueId}`;
}

async function captureFormScreenshot() {
    try {
        console.log('Starting screenshot capture...');
        const formElement = document.querySelector('.form-content');
        if (!formElement) {
            console.error('Form element not found for screenshot');
            return null;
        }
        
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true,
            width: formElement.offsetWidth,
            height: formElement.offsetHeight * 1.5
        });
        console.log('Screenshot captured successfully');
        return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        return null;
    }
}

function validateForm(form) {
    console.log('Validating form...');
    if (!form.checkValidity()) {
        console.log('Form validation failed - missing required fields');
        form.reportValidity();
        return false;
    }

    const requiredFields = ['firstName', 'lastName', 'idNumber', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !form.elements[field].value);
    
    if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields);
        showMessage(`חסרים שדות חובה: ${missingFields.join(', ')}`, 'error');
        return false;
    }

    console.log('Form validation passed');
    return true;
}

async function submitSection1() {
    try {
        console.log('1. Starting form submission process');
        showMessage('מעבד את הטופס...', 'info');
        
        const form = document.getElementById('section1-form');
        if (!validateForm(form)) {
            return false;
        }

        const submitButton = document.getElementById('saveAndContinue');
        submitButton.disabled = true;
        console.log('2. Submit button disabled');

        // Get form data
        const formData = new FormData(form);
        const screenshot = await captureFormScreenshot();
        
        console.log('3. Collected form data:', {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone')
        });

        if (screenshot) {
            document.getElementById('submitScreenshot').value = screenshot;
            console.log('4. Screenshot saved to hidden input');
        }

        const processedData = {
            timestamp: new Date().toISOString(),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            section: '1',
            formScreenshot: screenshot,
            downloadUrl: generateDownloadUrl({
                idNumber: formData.get('idNumber')
            })
        };

        console.log('5. Processed data ready for submission:', {
            ...processedData,
            formScreenshot: '[SCREENSHOT DATA HIDDEN]'
        });

        // Submit to Google Sheets
        console.log('6. Attempting submission to URL:', GOOGLE_SCRIPT_URL);
        showMessage('שולח את הטופס...', 'info');
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData)
        });

        console.log('7. Response received:', response);

        // Store for later combination
        localStorage.setItem('section1Data', JSON.stringify({
            ...processedData,
            formScreenshot: '[STORED SEPARATELY]'
        }));
        console.log('8. Data saved to localStorage');

        showMessage('הטופס נשלח בהצלחה', 'success');
        console.log('9. Success message shown');

        // Navigate to next section
        console.log('10. Preparing navigation to section 2');
        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 1000);

        return true;
    } catch (error) {
        console.error('Form submission error:', error);
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
    console.log('Page loaded, initializing form...');
    const form = document.getElementById('section1-form');
    const saveAndContinueBtn = document.getElementById('saveAndContinue');

    if (!form || !saveAndContinueBtn) {
        console.error('Required elements not found on page');
        return;
    }

    // Load saved data if exists
    const savedData = localStorage.getItem('section1Data');
    if (savedData) {
        try {
            console.log('Found saved data, attempting to restore');
            const data = JSON.parse(savedData);
            Object.entries(data).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                }
            });
            console.log('Saved data restored successfully');
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    // Handle form submission
    saveAndContinueBtn.addEventListener('click', async (e) => {
        console.log('Submit button clicked');
        e.preventDefault();
        await submitSection1();
    });
});

// Export necessary functions
window.submitSection1 = submitSection1;
window.showMessage = showMessage;
