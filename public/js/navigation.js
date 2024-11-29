document.addEventListener('DOMContentLoaded', function() {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');
    const btnBack = document.getElementById('btnBack');

    function navigateToNext() {
        const form = document.querySelector('form');
        const formId = form.id;
        let nextPage;

        // תיקון הנתיבים - הוספת /sections/
        switch(formId) {
            case 'section1-form':
                nextPage = 'sections/section2.html';
                break;
            case 'section2-form':
                nextPage = 'sections/section3.html';
                break;
            case 'section3-form':
                nextPage = 'sections/section4.html';
                break;
            case 'section4-form':
                nextPage = 'sections/thank-you.html';
                break;
            default:
                console.error('Unknown form ID:', formId);
                return;
        }

        // Save form data before navigation
        if (typeof saveFormData === 'function') {
            saveFormData();
        }

        // Navigate to next page
        window.location.href = nextPage;
    }

    function navigateBack() {
        const form = document.querySelector('form');
        const formId = form.id;
        let prevPage;

        // תיקון הנתיבים - הוספת /sections/
        switch(formId) {
            case 'section2-form':
                prevPage = '../section1.html';
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

        // Save form data before going back
        if (typeof saveFormData === 'function') {
            saveFormData();
        }

        window.location.href = prevPage;
    }

    function validateForm() {
        const form = document.querySelector('form');
        if (!form) return false;

        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            showError('נא למלא את כל השדות החובה');
        }

        return isValid;
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
        `;

        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Event Listeners
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', submitForm);
    }

    if (btnBack) {
        btnBack.addEventListener('click', navigateBack);
    }
});
