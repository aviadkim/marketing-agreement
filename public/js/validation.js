// Form validation functions
function validateIdNumber(value) {
    if (value.length !== 9) return false;
    return Array.from(value, Number)
        .reduce((sum, digit, i) => {
            const step = digit * ((i % 2) + 1);
            sum += step > 9 ? step - 9 : step;
            return sum;
        }, 0) % 10 === 0;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    return /^05\d{8}$/.test(phone);
}

function getCleanNumber(value) {
    return parseInt(value.replace(/[^\d]/g, ''));
}

function getErrorMessage(fieldName) {
    const messages = {
        'idNumber': 'מספר תעודת זהות לא תקין',
        'email': 'כתובת דואר אלקטרוני לא תקינה',
        'phone': 'מספר טלפון לא תקין (חייב להתחיל ב-05)',
        'investmentAmount': 'סכום ההשקעה המינימלי הוא 50,000 ש"ח',
        'currency': 'נא לבחור מטבע',
        'timeline': 'נא לבחור טווח השקעה',
        'purpose': 'נא לבחור לפחות מטרת השקעה אחת',
        'purposeOther': 'נא לפרט את מטרת ההשקעה האחרת',
        'signature': 'נא לחתום במקום המיועד',
        'default': 'נא למלא שדה זה'
    };
    return messages[fieldName] || messages.default;
}

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

function validateForm() {
    const form = document.querySelector('form');
    if (!form) return false;
    
    let isValid = true;
    let firstError = null;
    
    // Validate regular required fields
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(field => {
        field.classList.remove('error');
        let fieldIsValid = true;

        // Skip radio and checkbox validation here - we'll handle those separately
        if (field.type !== 'radio' && field.type !== 'checkbox') {
            if (!field.value.trim()) {
                fieldIsValid = false;
            } else {
                // Specific validations
                switch(field.name) {
                    case 'idNumber':
                        fieldIsValid = validateIdNumber(field.value);
                        break;
                    case 'email':
                        fieldIsValid = validateEmail(field.value);
                        break;
                    case 'phone':
                        fieldIsValid = validatePhone(field.value);
                        break;
                    case 'investmentAmount':
                        const cleanAmount = getCleanNumber(field.value);
                        fieldIsValid = !isNaN(cleanAmount) && cleanAmount >= 50000;
                        break;
                }
            }

            if (!fieldIsValid) {
                field.classList.add('error');
                isValid = false;
                if (!firstError) firstError = field;
                const errorMessage = getErrorMessage(field.name);
                showError(errorMessage);
            }
        }
    });

    // Validate radio button groups
    const radioGroups = ['currency', 'timeline'];
    radioGroups.forEach(groupName => {
        const checkedRadio = form.querySelector(`input[name="${groupName}"]:checked`);
        if (!checkedRadio) {
            isValid = false;
            showError(getErrorMessage(groupName));
        }
    });

    // Validate investment purpose (at least one checkbox must be checked)
    const purposeChecked = form.querySelectorAll('input[name="purpose"]:checked');
    if (purposeChecked.length === 0) {
        isValid = false;
        showError(getErrorMessage('purpose'));
    } else {
        // If 'other' is selected, validate the detail field
        const otherPurpose = Array.from(purposeChecked).find(input => input.value === 'other');
        if (otherPurpose && !form.elements['purposeOther'].value.trim()) {
            isValid = false;
            showError(getErrorMessage('purposeOther'));
        }
    }

    // Validate signature
    const signatureData = document.getElementById('signatureData');
    if (!signatureData || !signatureData.value) {
        isValid = false;
        showError(getErrorMessage('signature'));
    }

    if (!isValid && firstError) {
        firstError.focus();
    }

    return isValid;
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        validateForm,
        validateIdNumber,
        validateEmail,
        validatePhone,
        showError
    };
}
