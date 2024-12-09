const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

async function submitSection3() {
    console.log('[DEBUG] Starting section 3 submission');
    try {
        const form = document.getElementById('section3-form');
        if (!form) {
            throw new Error('Form not found');
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Add metadata
        data.section = '3';
        data.timestamp = new Date().toISOString();
        data.formScreenshot = await captureFormScreenshot();

        console.log('[DEBUG] Sending section 3 data');
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('[DEBUG] Section 3 submitted successfully');
        return true;
    } catch (error) {
        console.error('[ERROR] Section 3 submission failed:', error);
        return false;
    }
}

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
        console.error('[ERROR] Screenshot capture failed:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Section 3 initialized');
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            submitButton.disabled = true;
            submitButton.textContent = '????...';
            
            try {
                const success = await submitSection3();
                if (success) {
                    console.log('[DEBUG] Navigating to section 4');
                    window.location.href = '/sections/section4.html';
                }
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = '???? ???? ???';
            }
        });
    }
});