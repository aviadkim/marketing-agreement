const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';


function generateDownloadUrl(formData) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}_${formData.idNumber}`;
    return `${window.location.origin}/form/${uniqueId}`;
}

async function captureFormScreenshot() {
    try {
        const formElement = document.querySelector('.form-content');
        if (!formElement) return null;
        
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true,
            width: formElement.offsetWidth,
            height: formElement.offsetHeight * 1.5
        });
        return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
        console.error('Error capturing form:', error);
        return null;
    }
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

async function submitSection1() {
    try {
        showMessage('מעבד את הטופס...', 'info');
        
        // Validate form
        const form = document.getElementById('section1-form');
        if (!validateForm(form)) {
            return false;
        }

        // Process section data
        const processedData = await processSection1Data();
        
        console.log('Submitting section 1:', {
            ...processedData,
            formScreenshot: '[IMAGE DATA]'
        });

        // Submit to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData)
        });

        showMessage('הטופס נשלח בהצלחה', 'success');
        
        // Navigate to next section after short delay
        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 1000);

        return true;
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        throw error;
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
        showMessage(`חסרים שדות חובה: ${missingFields.join(', ')}`, 'error');
        return false;
    }

    return true;
}

function showMessage(message, type = 'error') {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
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
        background: ${
            type === 'success' ? '#4CAF50' : 
            type === 'info' ? '#2196F3' : 
            '#dc3545'
        };
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    
    if (type !== 'info') {
        setTimeout(() => div.remove(), 3000);
    }
}

// Main event listeners
document.addEventListener('DOMContentLoaded', () => {
    const saveAndContinueBtn = document.getElementById('saveAndContinue');
    if (saveAndContinueBtn) {
        saveAndContinueBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            saveAndContinueBtn.disabled = true;
            
            try {
                await submitSection1();
            } catch (error) {
                console.error('Submission failed:', error);
            } finally {
                saveAndContinueBtn.disabled = false;
            }
        });
    }
});

// Export necessary functions
window.submitSection1 = submitSection1;
window.showMessage = showMessage;
