// js/validation.js

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

function getErrorMessage(fieldName) {
    const messages = {
        'idNumber': 'מספר תעודת זהות לא תקין',
        'email': 'כתובת דואר אלקטרוני לא תקינה',
        'phone': 'מספר טלפון לא תקין (חייב להתחיל ב-05)',
        'investmentAmount': 'סכום ההשקעה המינימלי הוא 50,000 ש"ח',
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

    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    let firstError = null;

    requiredFields.forEach(field => {
        field.classList.remove('error');
        let fieldIsValid = true;

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
                    fieldIsValid = parseInt(field.value) >= 50000;
                    break;
                // Add other specific validations as needed
            }
        }

        if (!fieldIsValid) {
            field.classList.add('error');
            isValid = false;
            if (!firstError) firstError = field;

            const errorMessage = getErrorMessage(field.name);
            showError(errorMessage);
        }
    });

    if (!isValid && firstError) {
        firstError.focus();
    }

    return isValid;
}
