// validation.js
// Note: The validation functions are already included in navigation.js.
// If you prefer to keep validation separate, you can remove them from navigation.js and place them here.

function validateIdNumber(value) {
    if (value.length !== 9) return false;
    return Array.from(value, Number)
        .reduce((sum, digit, i) => {
            const step = digit * ((i % 2) + 1);
            return sum + (step > 9 ? step - 9 : step);
        }, 0) % 10 === 0;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    return /^05\d{8}$/.test(phone);
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
            }
        }

        if (!fieldIsValid) {
            field.classList.add('error');
            isValid = false;
            if (!firstError) firstError = field;
        }
    });

    if (!isValid) {
        firstError.focus();
        showError('נא למלא את כל השדות בצורה תקינה');
    }

    return isValid;
}
