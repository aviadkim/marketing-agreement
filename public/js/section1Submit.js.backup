const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

async function submitSection1() {
    console.log('[NETWORK] Starting form submission...');
    try {
        // Get form data
        const form = document.querySelector('#section1-form');
        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            timestamp: new Date().toISOString(),
            section: '1'
        };

        console.log('[NETWORK] Form data:', data);
        
        // Capture screenshot
        console.log('[NETWORK] Capturing screenshot...');
        data.formScreenshot = await captureFormScreenshot();

        // Submit to Google
        console.log('[NETWORK] Sending to Google Sheets:', GOOGLE_SCRIPT_URL);
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            mode: 'no-cors'
        });

        console.log('[NETWORK] Google Sheets response:', response);
        return true;
    } catch (error) {
        console.error('[ERROR] Form submission failed:', error);
        return false;
    }
}

async function captureFormScreenshot() {
    const formElement = document.querySelector('.form-content');
    const canvas = await html2canvas(formElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    });
    return canvas.toDataURL('image/png');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Section1 form initialized');
    
    const submitButton = document.getElementById('saveAndContinue');
    if (!submitButton) {
        console.error('[ERROR] Submit button not found');
        return;
    }

    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        submitButton.disabled = true;
        submitButton.textContent = '????...';

        try {
            const success = await submitSection1();
            if (success) {
                console.log('[SUCCESS] Form submitted, navigating...');
                window.location.href = '/sections/section2.html';
            }
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = '???? ???? ???';
        }
    });
});
