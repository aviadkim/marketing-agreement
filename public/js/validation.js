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
                        const amount = parseInt(field.value);
                        fieldIsValid = !isNaN(amount) && amount >= 50000;
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
            showError(`נא לבחור ${groupName === 'currency' ? 'מטבע' : 'טווח השקעה'}`);
        }
    });

    // Validate investment purpose (at least one checkbox must be checked)
    const purposeChecked = form.querySelectorAll('input[name="purpose"]:checked');
    if (purposeChecked.length === 0) {
        isValid = false;
        showError('נא לבחור לפחות מטרת השקעה אחת');
    } else {
        // If 'other' is selected, validate the detail field
        const otherPurpose = Array.from(purposeChecked).find(input => input.value === 'other');
        if (otherPurpose && !form.elements['purposeOther'].value.trim()) {
            isValid = false;
            showError('נא לפרט את מטרת ההשקעה האחרת');
        }
    }

    // Validate signature
    const signatureData = document.getElementById('signatureData');
    if (!signatureData || !signatureData.value) {
        isValid = false;
        showError('נא לחתום במקום המיועד');
    }

    if (!isValid && firstError) {
        firstError.focus();
    }

    return isValid;
}

// Add a hint about minimum investment amount to the UI
document.addEventListener('DOMContentLoaded', function() {
    const amountInput = document.querySelector('input[name="investmentAmount"]');
    if (amountInput) {
        const hint = amountInput.parentElement.querySelector('.input-hint');
        if (hint) {
            hint.textContent = 'יש להזין סכום בש"ח (מינימום 50,000 ש"ח) ללא נקודה עשרונית';
        }
    }
});
