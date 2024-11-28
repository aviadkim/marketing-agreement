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

        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();

        const routes = {
            'section1.html': '/sections/section2.html',
            'section2.html': '/sections/section3.html',
            'section3.html': '/sections/section4.html',
            'section4.html': '/sections/preview.html'
        };

        const nextPage = routes[currentPage];

        if (nextPage) {
            saveFormData();
            window.location.href = nextPage;
        } else {
            showError('לא נמצא העמוד הבא');
        }
    }

    function goBack() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();

        const routes = {
            'section2.html': '/sections/section1.html',
            'section3.html': '/sections/section2.html',
            'section4.html': '/sections/section3.html',
            'preview.html': '/sections/section4.html'
        };

        const prevPage = routes[currentPage];

        if (prevPage) {
            saveFormData();
            window.location.href = prevPage;
        } else {
            showError('לא נמצא העמוד הקודם');
        }
    }

    // Save form data
    function saveFormData() {
        const form = document.querySelector('form');
        if (!form) return;
        
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => data[key] = value);
        
        const currentFormData = JSON.parse(localStorage.getItem('formData') || '{}');
        currentFormData[form.id] = data;
        localStorage.setItem('formData', JSON.stringify(currentFormData));
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
