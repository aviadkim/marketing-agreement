const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKIS5nbJFMOCgLNZEsIFm0eWuGqkWb8v-1CqjAqHiM8iZ3VTrnKakaOg3PPjCiwOAM/exec';

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

async function submitSection1() {
    try {
        const form = document.getElementById('section1-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const submitButton = document.getElementById('saveAndContinue');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span>';

        showMessage('מעבד את הטופס...', 'info');

        // Get form data
        const formData = new FormData(form);
        const screenshot = await captureFormScreenshot();

        const processedData = {
            section: '1',
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            formScreenshot: screenshot,
            timestamp: new Date().toISOString()
        };

        // Generate download URL
        processedData.downloadUrl = generateDownloadUrl(processedData);

        // Log the data being sent (excluding screenshot)
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

        // Store for later combination
        localStorage.setItem('section1Data', JSON.stringify({
            ...processedData,
            formScreenshot: '[STORED SEPARATELY]'
        }));

        showMessage('הטופס נשלח בהצלחה', 'success');

        // Navigate to section 2
        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 1000);

        return true;
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<span class="button-text">המשך לשלב הבא</span>';
        }
        return false;
    }
}

// Main initialization
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