const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

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

        // Show loading state
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'שולח...';
        }

        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add screenshot and metadata
        data.formScreenshot = await captureFormScreenshot();
        data.timestamp = new Date().toISOString();
        data.section = '1';

        console.log('Sending data:', { ...data, formScreenshot: 'BASE64_STRING' });

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.text();
        console.log('Response:', responseData);

        // Store in localStorage
        localStorage.setItem('section1Data', JSON.stringify({
            ...data,
            formScreenshot: null // Don't store screenshot in localStorage
        }));

        return true;
    } catch (error) {
        console.error('Submit error:', error);
        alert('שגיאה בשליחת הטופס: ' + error.message);
        return false;
    } finally {
        // Reset button state
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'המשך לשלב הבא';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const success = await submitToGoogleSheets();
            
            if (success) {
                // Show success message before navigating
                alert('הנתונים נשלחו בהצלחה!');
                window.location.href = '/sections/section2.html';
            }
        });
    }
});
