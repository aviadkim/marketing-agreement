document.addEventListener('DOMContentLoaded', function() {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');
    const btnBack = document.getElementById('btnBack');

    function navigateToNext() {
        if (!validateForm()) return;

        // Get current form ID to determine which page we're on
        const form = document.querySelector('form');
        const formId = form.id;
        let nextPage;

        // Define navigation map
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

        // Save form data before navigation
        if (typeof saveFormData === 'function') {
            saveFormData();
        }

        // Navigate to next page
        window.location.href = nextPage;
    }

    function navigateBack() {
        // Get current form ID
        const form = document.querySelector('form');
        const formId = form.id;
        let prevPage;

        // Define reverse navigation map
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

        // Save current form data before going back
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
            if (field.type === 'radio') {
                // For radio buttons, check if any in the group is checked
                const groupName = field.name;
                const isChecked = form.querySelector(`input[name="${groupName}"]:checked`);
                if (!isChecked) {
                    isValid = false;
                    showError(`נא לבחור ${field.closest('.form-group').querySelector('label').textContent}`);
                }
            } else if (field.type === 'checkbox' && field.required) {
                if (!field.checked) {
                    isValid = false;
                    showError(`נא לסמן ${field.closest('.checkbox-container').textContent.trim()}`);
                }
            } else if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                showError(`נא למלא ${field.closest('.form-group').querySelector('label').textContent}`);
            } else {
                field.classList.remove('error');
            }
        });

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
            animation: fadeIn 0.3s ease-in;
        `;

        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        document.body.appendChild(errorDiv);
        setTimeout(() => {
            errorDiv.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }

    // Event Listeners
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', function() {
            if (validateForm()) {
                saveFormData();
                // Here you would typically submit the form to your server
                alert('הטופס נשלח בהצלחה!');
            }
        });
    }

    if (btnBack) {
        btnBack.addEventListener('click', navigateBack);
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey && saveAndContinue) {
            navigateToNext();
        }
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
});
