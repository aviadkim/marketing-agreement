// Constants and state
let currentSection = parseInt(window.location.pathname.match(/section(\d+)/)?.[1] || 1);
let formData = {};

// Debug logging function
function logDebug(message, data) {
    console.log(`[DEBUG] ${message}`, data || '');
}

// Load saved data from localStorage
function loadSavedData() {
    const saved = localStorage.getItem('formData');
    if (saved) {
        try {
            formData = JSON.parse(saved);
            populateFormFields();
            logDebug('Loaded saved data:', formData);
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Save form data to localStorage
function saveFormData(form) {
    const data = new FormData(form);
    const savedData = {};
    
    // Save all form fields
    data.forEach((value, key) => {
        savedData[key] = value;
        logDebug(`Saving field ${key}:`, value);
    });
    
    // Save signature if exists
    if (document.getElementById('signatureData')) {
        savedData.signature = document.getElementById('signatureData').value;
        if (savedData.signature) {
            localStorage.setItem('lastSignature', savedData.signature);
            logDebug('Saved signature');
        }
    }
    
    localStorage.setItem('formData', JSON.stringify(savedData));
    showSaveMessage();
}

// Validate section 2 specific fields
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
            amountField.classList.add('error');
        }
    }

    // Check bank selection
    const bankField = form.elements['bank'];
    if (bankField && !bankField.value) {
        isValid = false;
        errors.push('נא לבחור בנק');
        bankField.classList.add('error');
    }

    // Check currency selection
    const currencyChecked = form.querySelector('input[name="currency"]:checked');
    if (!currencyChecked) {
        isValid = false;
        errors.push('נא לבחור מטבע');
    }

    // Check timeline selection
    const timelineChecked = form.querySelector('input[name="timeline"]:checked');
    if (!timelineChecked) {
        isValid = false;
        errors.push('נא לבחור טווח השקעה');
    }

    // Check purpose (at least one must be selected)
    const purposeChecked = form.querySelectorAll('input[name="purpose"]:checked');
    if (purposeChecked.length === 0) {
        isValid = false;
        errors.push('נא לבחור לפחות מטרת השקעה אחת');
    }

    // Show errors if any
    if (!isValid) {
        errors.forEach(error => showError(error));
        logDebug('Section 2 validation failed:', errors);
    } else {
        logDebug('Section 2 validation passed');
    }

    return isValid;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Show save message
function showSaveMessage() {
    const message = document.createElement('div');
    message.className = 'save-message';
    message.textContent = 'נשמר בהצלחה';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
}

// Navigate to next section
function navigateNext() {
    const form = document.querySelector('form');
    if (!form) {
        logDebug('Form not found');
        return;
    }

    logDebug('Validating form...');
    let isValid = true;

    // Section specific validation
    if (currentSection === 2) {
        isValid = validateSection2();
    } else {
        isValid = form.checkValidity();
    }

    if (isValid) {
        logDebug('Form is valid, saving data...');
        saveFormData(form);
        logDebug(`Navigating to section ${currentSection + 1}`);
        window.location.href = `/sections/section${currentSection + 1}.html`;
    } else {
        logDebug('Form validation failed');
        form.reportValidity();
    }
}

// Navigate to previous section
function navigateBack() {
    if (currentSection > 1) {
        const form = document.querySelector('form');
        if (form) {
            saveFormData(form);
        }
        window.location.href = `/sections/section${currentSection - 1}.html`;
    }
}

// Populate form fields with saved data
function populateFormFields() {
    const form = document.querySelector('form');
    if (!form || !formData) return;

    Object.entries(formData).forEach(([key, value]) => {
        const field = form.elements[key];
        if (!field) return;

        if (field.type === 'checkbox') {
            field.checked = value === 'on';
        } else if (field.type === 'radio') {
            const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
            if (radio) radio.checked = true;
        } else if (field.type === 'select-one' || field.type === 'select-multiple') {
            if (value) field.value = value;
        } else {
            field.value = value;
        }
    });

    // Load signature if exists
    const signatureData = localStorage.getItem('lastSignature');
    if (signatureData && window.signatureHandler?.signaturePad) {
        window.signatureHandler.signaturePad.fromDataURL(signatureData);
        if (document.getElementById('signatureData')) {
            document.getElementById('signatureData').value = signatureData;
        }
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    logDebug('Initializing page', `Section ${currentSection}`);
    
    // Load saved data
    loadSavedData();

    // Auto-save on form changes
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('change', function() {
            logDebug('Form changed, saving...');
            saveFormData(this);
        });
    }

    // Back button
    const backButton = document.getElementById('btnBack');
    if (backButton) {
        backButton.addEventListener('click', function() {
            logDebug('Back button clicked');
            navigateBack();
        });
    }

    // Next button (for sections 1-3)
    const nextButton = document.getElementById('saveAndContinue');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            logDebug('Next button clicked');
            navigateNext();
        });
    }

    // Submit button (for section 4)
    const submitButton = document.getElementById('finalSubmit');
    if (submitButton) {
        submitButton.addEventListener('click', submitFinalForm);
    }
});
