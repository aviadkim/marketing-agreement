document.addEventListener('DOMContentLoaded', function() {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');
    const backButton = document.querySelector('.btn-prev');

    // Form validation functions
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

    // Navigation functions
    function navigateToNext() {
        if (!validateForm()) return;

        const form = document.querySelector('form');
        const formId = form.id;
        let nextPage;

        switch(formId) {
            case 'section1-form':
                nextPage = 'section2.html';
                break;
            case 'section2-form':
                nextPage = 'section3.html';
                break;
            case 'section3-form':
                nextPage = 'section4.html';
                break;
            case 'section4-form':
                nextPage = 'thank-you.html';
                break;
            default:
                console.error('Unknown form ID:', formId);
                return;
        }

        // Save current form data
        if (typeof saveFormData === 'function') {
            saveFormData();
        }

        // Log navigation details
        console.log('Navigating from:', formId);
        console.log('Navigating to:', nextPage);

        // Perform navigation
        window.location.href = nextPage;
    }

    function goBack() {
        const form = document.querySelector('form');
        const formId = form.id;
        let prevPage;

        switch(formId) {
            case 'section2-form':
                prevPage = 'section1.html';
                break;
            case 'section3-form':
                prevPage = 'section2.html';
                break;
            case 'section4-form':
                prevPage = 'section3.html';
                break;
            default:
                return;
        }

        if (typeof saveFormData === 'function') {
            saveFormData();
        }

        window.location.href = prevPage;
    }

    // Error handling
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

    // Form submission
    async function submitFinalForm() {
        if (!validateForm()) return;

        try {
            const allData = JSON.parse(localStorage.getItem('formData') || '{}');
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(allData)
            });

            if (response.ok) {
                localStorage.removeItem('formData');
                window.location.href = '/thank-you.html';
            } else {
                throw new Error('שגיאה בשליחת הטופס');
            }
        } catch (error) {
            showError('אירעה שגיאה בשליחת הטופס: ' + error.message);
        }
    }

    // Event listeners
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', submitFinalForm);
    }

    if (backButton) {
        backButton.addEventListener('click', goBack);
    }

    // Handle keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey && saveAndContinue) {
            navigateToNext();
        }
    });
});
