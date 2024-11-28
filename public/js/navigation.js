document.addEventListener('DOMContentLoaded', function () {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');

    // פונקציית מעבר לעמוד הבא
    function navigateToNext() {
        const form = document.querySelector('form');
        if (!form) {
            console.error('Form not found');
            return;
        }

        // בדיקת שם הטופס כדי לדעת באיזה דף אנחנו
        const formId = form.id; // למשל section1-form
        console.log('Form ID:', formId);

        // קביעת העמוד הבא לפי ID של הטופס
        let nextPage;
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
                showError('שגיאה בניווט');
                return;
        }

        // בדיקת תקינות
        if (!validateForm(form)) {
            return;
        }

        // שמירת נתונים ומעבר
        if (typeof saveFormData === 'function') {
            saveFormData();
        }
        
        console.log('Navigating to:', nextPage);
        window.location.href = nextPage;
    }

    function validateForm(form) {
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
});
