// section1Submit.js
console.log('section1Submit.js loaded');

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
        console.error('Screenshot capture error:', error);
        return null;
    }
}

function validateForm(form) {
    console.log('Validating form...');
    if (!form.checkValidity()) {
        console.log('Form validation failed');
        form.reportValidity();
        return false;
    }
    return true;
}

async function handleFormSubmission(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigation.js from handling
    }
    
    console.log('Starting form submission...');
    showMessage('מעבד את הטופס...', 'info');
    
    const form = document.getElementById('section1-form');
    if (!validateForm(form)) {
        return false;
    }

    const submitButton = document.getElementById('saveAndContinue');
    submitButton.disabled = true;

    try {
        // Capture form data and screenshot
        const formData = new FormData(form);
        console.log('Form data collected');
        
        const screenshot = await captureFormScreenshot();
        if (!screenshot) {
            throw new Error('Failed to capture screenshot');
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

        console.log('Data being sent:', {
            url: GOOGLE_SCRIPT_URL,
            data: { ...processedData, formScreenshot: '[SCREENSHOT DATA HIDDEN]' }
        });

        // Submit to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData)
        }).catch(error => {
            console.error('Fetch error:', error);
            throw error;
        });

        console.log('Response received:', response);

        // Store data locally
        localStorage.setItem('section1Data', JSON.stringify({
            ...processedData,
            formScreenshot: screenshot
        }));

        showMessage('הטופס נשלח בהצלחה', 'success');
        
        // Navigate to next section
        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 1000);

        return true;
    } catch (error) {
        console.error('Submission error:', error);
        showMessage('שגיאה בשליחת הטופס', 'error');
        submitButton.disabled = false;
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

    // Remove any existing click handlers
    submitButton.replaceWith(submitButton.cloneNode(true));
    const newSubmitButton = document.getElementById('saveAndContinue');
    
    // Add our submit handler
    newSubmitButton.addEventListener('click', handleFormSubmission);
});

// Disable navigation.js form handling for section 1
if (typeof window.handleFormSubmit === 'function') {
    const originalHandleFormSubmit = window.handleFormSubmit;
    window.handleFormSubmit = function(event) {
        if (window.location.pathname.includes('section1')) {
            return handleFormSubmission(event);
        }
        return originalHandleFormSubmit(event);
    };
}

// Export necessary functions
window.submitSection1 = handleFormSubmission;
window.showMessage = showMessage;
