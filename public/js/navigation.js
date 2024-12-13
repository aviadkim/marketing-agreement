// public/js/navigation.js
let currentSection = parseInt(window.location.pathname.match(/section(\d+)/)?.[1] || 1);

function logDebug(message, data = '') {
    console.log(`[DEBUG] ${message}`, data);
}

// Form submission for section 1
async function submitSection1(form) {
    try {
        const formData = new FormData(form);
        
        // Create screenshot
        const formElement = document.querySelector('.form-card');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        
        // Convert to base64
        const screenshot = canvas.toDataURL('image/png', 1.0);
        
        // Upload screenshot to Storage
        const fileName = `section1_${Date.now()}.png`;
        const storageRef = firebase.storage().ref(`screenshots/${fileName}`);
        await storageRef.putString(screenshot, 'data_url');
        const screenshotUrl = await storageRef.getDownloadURL();

        // Prepare document data
        const docData = {
            section: "1",
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            screenshotUrl: screenshotUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'completed'
        };

        // Save to Firestore
        const docRef = await db.collection('forms').add(docData);
        console.log('[DEBUG] Form saved to Firestore:', docRef.id);

        return true;
    } catch (error) {
        console.error('[ERROR] Section 1 submission failed:', error);
        showMessage("שגיאה בשליחת הטופס: " + error.message);
        return false;
    }
}

async function navigateNext() {
    const form = document.querySelector('form');
    if (!form) {
        logDebug('Form not found');
        return;
    }

    let isValid = true;
    
    // Section 1 special handling
    if (currentSection === 1) {
        if (form.checkValidity()) {
            const submitButton = document.getElementById('saveAndContinue');
            const buttonText = submitButton.querySelector('.button-text');
            const buttonLoader = submitButton.querySelector('.button-loader');
            
            // Update UI
            submitButton.disabled = true;
            buttonText.style.opacity = '0';
            buttonLoader.style.display = 'block';

            try {
                const success = await submitSection1(form);
                if (success) {
                    saveFormData();
                    window.location.href = '/sections/section2.html';
                }
            } finally {
                submitButton.disabled = false;
                buttonText.style.opacity = '1';
                buttonLoader.style.display = 'none';
            }
            return;
        } else {
            form.reportValidity();
            return;
        }
    }

    // Other sections validation
    if (currentSection === 2) {
        isValid = validateSection2();
    } else if (currentSection === 3) {
        isValid = validateSection3();
    } else if (currentSection === 4) {
        return validateSection4();
    }

    if (isValid) {
        saveFormData();
        window.location.href = `/sections/section${currentSection + 1}.html`;
    }
}

function navigateBack() {
    if (currentSection > 1) {
        saveFormData();
        window.location.href = `/sections/section${currentSection - 1}.html`;
    }
}

// הפונקציות הקיימות נשארות אותו דבר
// loadSavedData, populateFormFields, saveFormData, validateSection2, validateSection3, validateSection4...

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    logDebug('Initializing page', `Section ${currentSection}`);
    
    loadSavedData();

    // Setup auto-save
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('change', saveFormData);
    }

    // Setup navigation buttons
    const backButton = document.getElementById('btnBack');
    if (backButton) {
        backButton.addEventListener('click', navigateBack);
    }

    const nextButton = document.getElementById('saveAndContinue');
    if (nextButton) {
        nextButton.addEventListener('click', navigateNext);
    }
});

// Export necessary functions
window.loadSavedData = loadSavedData;
window.saveFormData = saveFormData;
window.navigateNext = navigateNext;
window.navigateBack = navigateBack;
window.showMessage = showMessage;
