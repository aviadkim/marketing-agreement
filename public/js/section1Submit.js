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

        // Show loading
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '????...';
        }

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

        console.log('Sending data:', data);

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Response:', response);

        // Save to localStorage for debugging
        localStorage.setItem('lastSubmittedData', JSON.stringify({
            ...data,
            formScreenshot: null
        }));

        return true;
    } catch (error) {
        console.error('Submit error:', error);
        alert('????? ?????? ?????: ' + error.message);
        return false;
    } finally {
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = '???? ???? ???';
        }
    }
}

// Initialize form handler
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
