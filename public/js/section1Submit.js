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
        return canvas.toDataURL('image/png');
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

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Add screenshot
        data.formScreenshot = await captureFormScreenshot();
        data.timestamp = new Date().toISOString();

        console.log('Sending data:', data);

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Response received:', response);
        return true;

    } catch (error) {
        console.error('Submit error:', error);
        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            submitButton.disabled = true;
            const success = await submitToGoogleSheets();
            
            if (success) {
                window.location.href = '/sections/section2.html';
            } else {
                submitButton.disabled = false;
                alert('אירעה שגיאה בשליחת הטופס');
            }
        });
    }
});
