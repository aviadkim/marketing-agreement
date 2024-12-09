const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

async function captureFormScreenshot() {
    console.log('[DEBUG] Starting screenshot capture');
    try {
        const formElement = document.querySelector('.form-content');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        console.log('[DEBUG] Screenshot captured successfully');
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('[DEBUG] Screenshot capture failed:', error);
        return null;
    }
}

async function submitSection1() {
    console.log('[DEBUG] Starting section1 submission');
    try {
        const form = document.querySelector('#section1-form');
        if (!form) {
            throw new Error('Form not found');
        }

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Add screenshot
        data.formScreenshot = await captureFormScreenshot();
        console.log('[DEBUG] Form data ready:', data);

        // Submit to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('[DEBUG] Section1 submitted successfully');
        localStorage.setItem('section1Data', JSON.stringify(data));
        return true;

    } catch (error) {
        console.error('[DEBUG] Section1 submission failed:', error);
        return false;
    }
}

// Initialize form handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Section1 initialized');
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            console.log('[DEBUG] Submit button clicked');
            submitButton.disabled = true;
            submitButton.textContent = '????...';
            
            try {
                const success = await submitSection1();
                if (success) {
                    console.log('[DEBUG] Navigating to section 2');
                    window.location.href = '/sections/section2.html';
                }
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = '???? ???? ???';
            }
        });
    }
});
