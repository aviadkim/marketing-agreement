// Constants
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
        const formElement = document.querySelector('.form-content');
        if (!formElement) return null;
        
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true,
            width: formElement.offsetWidth,
            height: formElement.offsetHeight * 1.5
        });
        return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
        console.error('Error capturing form:', error);
        return null;
    }
}

// Main Submit Function
async function submitSection1() {
    try {
        const form = document.getElementById('section1-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const submitButton = document.getElementById('saveAndContinue');
        submitButton.disabled = true;
        submitButton.querySelector('.button-text').style.display = 'none';
        submitButton.querySelector('.button-loader').style.display = 'block';

        showMessage('מעבד את הטופס...', 'info');

        // Get form data
        const formData = new FormData(form);
        const screenshot = await captureFormScreenshot();
        document.getElementById('submitScreenshot').value = screenshot;

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

        // Store for later combination
        localStorage.setItem('section1Data', JSON.stringify({
            ...processedData,
            formScreenshot: '[STORED SEPARATELY]'
        }));

        showMessage('הטופס נשלח בהצלחה', 'success');

        // Navigate to next section
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
            submitButton.querySelector('.button-text').style.display = 'block';
            submitButton.querySelector('.button-loader').style.display = 'none';
        }
        return false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('section1-form');
    const saveAndContinueBtn = document.getElementById('saveAndContinue');

    if (!form || !saveAndContinueBtn) {
        console.error('Required elements not found');
        return;
    }

    // Load saved data if exists
    const savedData = localStorage.getItem('section1Data');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.entries(data).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                }
            });
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    // Handle form submission
    saveAndContinueBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await submitSection1();
    });
});

// Export necessary functions
window.submitSection1 = submitSection1;
window.showMessage = showMessage;
