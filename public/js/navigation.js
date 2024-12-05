// Get current section number from URL
let currentSection = parseInt(window.location.pathname.match(/section(\d+)/)?.[1] || 1);

// Debug logging
function logDebug(message, data = '') {
    console.log(`[DEBUG] ${message}`, data);
}

// Load saved data from localStorage
function loadSavedData() {
    const saved = localStorage.getItem(`section${currentSection}Data`);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            populateFormFields(data);
            logDebug('Loaded saved data:', data);
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Populate form fields with saved data
function populateFormFields(data) {
    const form = document.querySelector('form');
    if (!form || !data) return;

    Object.entries(data).forEach(([key, value]) => {
        const field = form.elements[key];
        if (!field) return;

        if (field.type === 'checkbox' || field.type === 'radio') {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    const input = form.querySelector(`input[name="${key}"][value="${v}"]`);
                    if (input) input.checked = true;
                });
            } else {
                if (typeof value === 'boolean') {
                    field.checked = value;
                } else {
                    field.checked = value === 'on' || value === true;
                }
            }
        } else if (field.type === 'select-one' || field.type === 'select-multiple') {
            if (value) field.value = value;
        } else {
            field.value = value || '';
        }
    });

    // Load signature if exists
    if (data.signature && window.signatureHandler?.signaturePad) {
        window.signatureHandler.signaturePad.fromDataURL(data.signature);
        if (document.getElementById('signatureData')) {
            document.getElementById('signatureData').value = data.signature;
        }
    }
}

// Save form data to localStorage
function saveFormData() {
    const form = document.querySelector('form');
    if (!form) return;

    const formData = {};
    const data = new FormData(form);

    data.forEach((value, key) => {
        // Handle multiple checkboxes with same name
        if (key in formData) {
            if (!Array.isArray(formData[key])) {
                formData[key] = [formData[key]];
            }
            formData[key].push(value);
        } else {
            formData[key] = value;
        }
    });

    // Save signature if exists
    const signatureData = document.getElementById('signatureData')?.value;
    if (signatureData) {
        formData.signature = signatureData;
        localStorage.setItem('lastSignature', signatureData);
    }

    localStorage.setItem(`section${currentSection}Data`, JSON.stringify(formData));
    showMessage('נשמר בהצלחה', 'success');
    logDebug('Saved form data:', formData);
}

// Validate section 2
function validateSection2() {
    const form = document.querySelector('#section2-form');
    if (!form) return true;

    let isValid = true;
    const errors = [];

    // Check investment amount
    const amountField = form.elements['investmentAmount'];
    if (amountField) {
        const amount = parseInt(amountField.value.replace(/[^\d]/g, ''));
        if (isNaN(amount) || amount < 100000) {
            isValid = false;
            errors.push('סכום ההשקעה המינימלי הוא 100,000 ש"ח');
        }
    }

    // Check bank
    if (!form.elements['bank'].value) {
        isValid = false;
        errors.push('נא לבחור בנק');
    }

    // Check currency
    if (!form.querySelector('input[name="currency"]:checked')) {
        isValid = false;
        errors.push('נא לבחור מטבע');
    }

    // Check timeline
    if (!form.querySelector('input[name="timeline"]:checked')) {
        isValid = false;
        errors.push('נא לבחור טווח השקעה');
    }

    // Check purpose (at least one)
    if (!form.querySelector('input[name="purpose"]:checked')) {
        isValid = false;
        errors.push('נא לבחור לפחות מטרת השקעה אחת');
    }

    if (!isValid) {
        errors.forEach(error => showMessage(error, 'error'));
    }

    logDebug('Section 2 validation:', { isValid, errors });
    return isValid;
}

// Validate section 3
function validateSection3() {
    const form = document.querySelector('form');
    if (!form) return false;

    let isValid = true;
    const errors = [];

    // Check market experience
    if (!form.querySelector('input[name="marketExperience"]:checked')) {
        isValid = false;
        errors.push('יש לבחור רמת ידע וניסיון בשוק ההון');
    }

    // Check risk tolerance
    if (!form.querySelector('input[name="riskTolerance"]:checked')) {
        isValid = false;
        errors.push('יש לבחור רמת סיכון');
    }

    // Check loss response
    if (!form.querySelector('input[name="lossResponse"]:checked')) {
        isValid = false;
        errors.push('יש לבחור תגובה להפסד');
    }

    // Check investment knowledge
    if (!form.querySelector('input[name="investmentKnowledge"]:checked')) {
        isValid = false;
        errors.push('יש לבחור לפחות סוג השקעה אחד');
    }

    if (!isValid) {
        errors.forEach(error => showMessage(error, 'error'));
    }

    return isValid;
}

// Show message (success/error)
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

// Navigate to next section
function navigateNext() {
    const form = document.querySelector('form');
    if (!form) {
        logDebug('Form not found');
        return;
    }

    let isValid = true;

    if (currentSection === 2) {
        isValid = validateSection2();
    } else if (currentSection === 3) {
        isValid = validateSection3();
    } else if (currentSection === 4) {  // Add this section
        isValid = validateSection4();
        if (isValid) {
            saveFormData();
            // After section 4, redirect to thank you page
            window.location.href = '/sections/thank-you.html';
            return;
        }
    }

    if (isValid) {
        logDebug('Form is valid, saving and navigating...');
        saveFormData();
        window.location.href = `/sections/section${currentSection + 1}.html`;
    } else {
        logDebug('Form validation failed');
    }
}

// Navigate to previous section
function navigateBack() {
    if (currentSection > 1) {
        saveFormData();
        window.location.href = `/sections/section${currentSection - 1}.html`;
    }
}

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
