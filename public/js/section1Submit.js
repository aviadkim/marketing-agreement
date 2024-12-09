const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

async function submitSection1() {
    console.log('[DEBUG] Starting section1 submission');
    try {
        const form = document.querySelector('#section1-form');
        if (!form) {
            console.error('[DEBUG] Form not found');
            return false;
        }

        // Show loading state
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '????...';
        }

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Add metadata
        data.timestamp = new Date().toISOString();
        data.section = '1';

        // Add screenshot
        try {
            data.formScreenshot = await captureFormScreenshot();
            console.log('[DEBUG] Screenshot captured');
        } catch (error) {
            console.error('[DEBUG] Screenshot capture failed:', error);
        }

        console.log('[DEBUG] Sending data to Google Sheets:', data);

        // Submit to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('[DEBUG] Response from Google Sheets:', response);

        // Save to localStorage
        localStorage.setItem('section1Data', JSON.stringify({
            ...data,
            formScreenshot: '[SCREENSHOT DATA]'
        }));

        return true;
    } catch (error) {
        console.error('[DEBUG] Submission error:', error);
        return false;
    } finally {
        // Reset button state
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = '???? ???? ???';
        }
    }
}

async function captureFormScreenshot() {
    console.log('[DEBUG] Starting screenshot capture');
    const formElement = document.querySelector('.form-content');
    if (!formElement) {
        throw new Error('Form content element not found');
    }

    const canvas = await html2canvas(formElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    });

    return canvas.toDataURL('image/png');
}

// Initialize form handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Section1 initialized');
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('[DEBUG] Submit button clicked');
            
            const success = await submitSection1();
            if (success) {
                console.log('[DEBUG] Navigating to section 2');
                window.location.href = '/sections/section2.html';
            }
        });
    } else {
        console.error('[DEBUG] Submit button not found');
    }
});
