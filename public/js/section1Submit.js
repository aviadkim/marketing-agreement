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
        console.log('Starting form submission');
        const form = document.querySelector('#section1-form');
        if (!form) {
            console.error('Form not found');
            return false;
        }

        // Show loading state
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'שולח...';
        }

        // Get form data
        const formData = new FormData(form);
        const data = {};

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Add metadata
        data.formScreenshot = await captureFormScreenshot();
        data.timestamp = new Date().toISOString();
        data.section = '1';

        console.log('Sending data to Google Sheets:', {
            ...data,
            formScreenshot: '[SCREENSHOT DATA]'
        });

        // Send to Google Sheets with no-cors mode
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status);

        // Save to localStorage
        localStorage.setItem('section1Data', JSON.stringify({
            ...data,
            formScreenshot: null // Don't store large screenshot in localStorage
        }));

        return true;

    } catch (error) {
        console.error('Submit error:', error);
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
    console.log('Section 1 form initialized');
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            console.log('Submit button clicked');
            const success = await submitToGoogleSheets();
            
            if (success) {
                console.log('Form submitted successfully');
                window.location.href = '/sections/section2.html';
            } else {
                console.error('Form submission failed');
            }
        });
    } else {
        console.error('Submit button not found');
    }
});