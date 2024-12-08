const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwf-7F8NIXbcDGTCKsx_5eCfxv9BTgGkSTYKMfWbCQNm37Rab2HA70gt8MkiXZWd6Ps/exec';

// Capture form screenshot
async function captureFormScreenshot() {
    try {
        const formElement = document.querySelector('.form-content');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        const screenshot = canvas.toDataURL('image/png');
        
        // Store screenshot in localStorage
        localStorage.setItem('section1Screenshot', screenshot);
        
        return screenshot;
    } catch (error) {
        console.error('Screenshot error:', error);
        return null;
    }
}

// Submit form data
async function submitToGoogleSheets() {
    try {
        const form = document.querySelector('#section1-form');
        if (!form) return false;

        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Add metadata
        data.section = '1';
        data.formScreenshot = await captureFormScreenshot();
        data.timestamp = new Date().toISOString();

        console.log('Sending data:', {...data, formScreenshot: '[SCREENSHOT DATA]'});

        // Save to localStorage before submission
        localStorage.setItem('section1Data', JSON.stringify({
            ...data,
            formScreenshot: data.formScreenshot
        }));

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Response received:', response);
        
        // Show success message
        showMessage('הנתונים נשמרו בהצלחה', 'success');
        
        return true;
    } catch (error) {
        console.error('Submit error:', error);
        showMessage('אירעה שגיאה בשליחת הטופס', 'error');
        return false;
    }
}

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> מעבד...';
            
            const success = await submitToGoogleSheets();
            
            if (success) {
                submitButton.innerHTML = 'ממשיך לשלב הבא...';
                window.location.href = '/sections/section2.html';
            } else {
                submitButton.disabled = false;
                submitButton.innerHTML = 'המשך לשלב הבא';
            }
        });
    }
});
