// Get current section number from URL
let currentSection = parseInt(window.location.pathname.match(/section(\d+)/)?.[1] || 1);
let formData = {};

// Debug logging
function logDebug(message, data) {
    console.log(`[DEBUG] ${message}`, data || '');
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
                const input = form.querySelector(`input[name="${key}"][value="${value}"]`);
                if (input) input.checked = true;
            }
        } else if (field.type === 'select-one' || field.type === 'select-multiple') {
            if (value) field.value = value;
        } else {
            field.value = value;
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

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    });

    // Save signature if exists
    const signatureData = document.getElementById('signatureData')?.value;
    if (signatureData) {
        data.signature = signatureData;
        localStorage.setItem('lastSignature', signatureData);
    }

    localStorage.setItem(`section${currentSection}Data`, JSON.stringify(data));
    showMessage('נשמר בהצלחה', 'success');
    logDebug('Saved form data:', data);
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

    // Show errors if any
    if (!isValid) {
        errors.forEach(error => showMessage(error, 'error'));
    }

    logDebug('Section 2 validation:', { isValid, errors });
    return isValid;
}

// Validate section 3
function validateSection3() {
    const form = document.querySelector('form');
    
    const marketExperience = form.querySelector('input[name="marketExperience"]:checked');
    if (!marketExperience) {
        showMessage('יש לבחור רמת ידע וניסיון בשוק ההון', 'error');
        return false;
    }

    const riskTolerance = form.querySelector('input[name="riskTolerance"]:checked');
    if (!riskTolerance) {
        showMessage('יש לבחור רמת סיכון', 'error');
        return false;
    }

    const lossResponse = form.querySelector('input[name="lossResponse"]:checked');
    if (!lossResponse) {
        showMessage('יש לבחור תגובה להפסד', 'error');
        return false;
    }

    const investmentKnowledge = form.querySelector('input[name="investmentKnowledge"]:checked');
    if (!investmentKnowledge) {
        showMessage('יש לבחור לפחות סוג השקעה אחד', 'error');
        return false;
    }

    return true;
}

// Show message (success/error)
function showMessage(message, type = 'success') {
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
    } else {
        isValid = form.checkValidity();
        if (!isValid) form.reportValidity();
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

// Submit form to Google Sheets
async function submitToGoogleSheets() {
    const allData = {};
    
    // Collect data from all sections
    for (let i = 1; i <= 4; i++) {
        const sectionData = localStorage.getItem(`section${i}Data`);
        if (sectionData) {
            Object.assign(allData, JSON.parse(sectionData));
        }
    }

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(allData)
        });

        if (!response.ok) throw new Error('שגיאה בשליחת הנתונים');

        // Clear local storage after successful submission
        for (let i = 1; i <= 4; i++) {
            localStorage.removeItem(`section${i}Data`);
        }
        localStorage.removeItem('lastSignature');

        return true;
    } catch (error) {
        console.error('Submission error:', error);
        showMessage('שגיאה בשליחת הטופס', 'error');
        return false;
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
    document.getElementById('btnBack')?.addEventListener('click', navigateBack);
    document.getElementById('saveAndContinue')?.addEventListener('click', navigateNext);
    
    // Setup final submit
    document.getElementById('finalSubmit')?.addEventListener('click', submitToGoogleSheets);
});
