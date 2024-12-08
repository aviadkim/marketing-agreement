const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

// Debug utility
function debugLog(message, data = '') {
    console.log(`[DEBUG] ${message}`, data);
}

async function captureFormScreenshot() {
    debugLog('Starting screenshot capture');
    try {
        const formElement = document.querySelector('.form-content');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        debugLog('Screenshot captured successfully');
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('[ERROR] Screenshot capture failed:', error);
        return null;
    }
}

async function processSection1Data() {
    debugLog('Processing section 1 data');
    try {
        const form = document.getElementById('section1-form');
        const formData = new FormData(form);
        const screenshot = await captureFormScreenshot();

        const sectionData = {
            section: '1',
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            formScreenshot: screenshot,
            timestamp: new Date().toISOString()
        };

        debugLog('Section 1 data processed:', sectionData);
        return sectionData;
    } catch (error) {
        console.error('[ERROR] Processing section 1:', error);
        throw error;
    }
}

async function submitToGoogleSheets() {
    debugLog('Starting form submission');
    try {
        const form = document.getElementById('section1-form');
        if (!form) {
            console.error('[ERROR] Form not found');
            return false;
        }

        const processedData = await processSection1Data();
        debugLog('Sending data to Google Sheets:', processedData);

        console.log('[NETWORK] Sending request to:', GOOGLE_SCRIPT_URL);
const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData)
        });

        console.log('[NETWORK] Response status:', response.status);
console.log('[NETWORK] Response headers:', Object.fromEntries(response.headers));
debugLog('Google Sheets response:', response);

// Additional verification
if (!response.ok && response.status !== 0) {
    throw new Error(`Network response was not ok: ${response.status}`);
}

        // Store in localStorage for verification
        localStorage.setItem('lastSubmittedData', JSON.stringify({
            ...processedData,
            formScreenshot: '[SCREENSHOT DATA]'
        }));

        debugLog('Data stored in localStorage');
        return true;
    } catch (error) {
        console.error('[ERROR] Submit error:', error);
        alert('????? ?????? ?????: ' + error.message);
        return false;
    }
}

// Initialize form handler
document.addEventListener('DOMContentLoaded', () => {
    debugLog('Initializing section 1 form');
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            debugLog('Submit button clicked');
            
            submitButton.disabled = true;
            submitButton.textContent = '????...';
            
            try {
                debugLog('Starting submission process');
                const success = await submitToGoogleSheets();
                
                if (success) {
                    debugLog('Submission successful, navigating to section 2');
                    setTimeout(() => {
                        window.location.href = '/sections/section2.html';
                    }, 1000);
                }
            } catch (error) {
                console.error('[ERROR] Submission process failed:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = '???? ???? ???';
            }
        });
    } else {
        console.error('[ERROR] Submit button not found');
    }
});

