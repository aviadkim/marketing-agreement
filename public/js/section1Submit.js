const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

function generateDownloadUrl(formData) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}_${formData.idNumber}`;
    return `${window.location.origin}/form/${uniqueId}`;
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

function validateForm(form) {
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    const requiredFields = ['firstName', 'lastName', 'idNumber', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !form.elements[field].value);
    
    if (missingFields.length > 0) {
        showMessage('?? ???? ?? ?? ????? ?????');
        return false;
    }

    return true;
}

async function processSection1Data() {
    try {
        const form = document.getElementById('section1-form');
        const formData = new FormData(form);

        // Capture current section screenshot
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

        // Generate unique URL for this section
        sectionData.downloadUrl = generateDownloadUrl(sectionData);

        // Store for later combination
        localStorage.setItem('section1Data', JSON.stringify({
            ...sectionData,
            formScreenshot: '[STORED SEPARATELY]'
        }));

        return sectionData;
    } catch (error) {
        console.error('Error processing section 1:', error);
        throw error;
    }
}

async function submitToGoogleSheets() {
    try {
        showMessage('???? ??????...', 'info');
        
        const form = document.getElementById('section1-form');
        if (!validateForm(form)) {
            return false;
        }

        // Process section data
        const processedData = await processSection1Data();
        
        console.log('Submitting data:', {
            ...processedData,
            formScreenshot: '[IMAGE DATA]'
        });

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData)
        });

        showMessage('????? ???? ??????', 'success');
        return true;
    } catch (error) {
        console.error('Submit error:', error);
        showMessage(error.message || '????? ?????? ?????');
        return false;
    }
}

// Initialize form handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('Section 1 form initialized');
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            submitButton.disabled = true;
            submitButton.textContent = '????...';
            
            try {
                const success = await submitToGoogleSheets();
                if (success) {
                    console.log('Form submitted successfully');
                    setTimeout(() => {
                        window.location.href = '/sections/section2.html';
                    }, 1000);
                }
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = '???? ???? ???';
            }
        });
    } else {
        console.error('Submit button not found');
    }
});
