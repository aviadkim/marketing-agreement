// navigation.js
document.addEventListener('DOMContentLoaded', function() {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');

    // בדיקת תקינות הטופס
    function validateForm() {
        const form = document.querySelector('form');
        const allInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        allInputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }

    // מעבר לדף הבא
    function navigateToNext() {
        if (!validateForm()) {
            alert('נא למלא את כל השדות החובה');
            return;
        }

        const currentPath = window.location.pathname;
        let nextPage;

        if (currentPath.includes('section1.html')) {
            nextPage = 'section2.html';
        } else if (currentPath.includes('section2.html')) {
            nextPage = 'section3.html';
        } else if (currentPath.includes('section3.html')) {
            nextPage = 'section4.html';
        }

        if (nextPage) {
            window.location.href = nextPage;
        }
    }

    // הגשת הטופס
    async function submitForm() {
        if (!validateForm()) {
            alert('נא למלא את כל השדות החובה');
            return;
        }

        try {
            const formData = new FormData(document.querySelector('form'));
            const response = await fetch('/api/submit', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                window.location.href = '/thank-you.html';
            } else {
                throw new Error('שגיאה בשליחת הטופס');
            }
        } catch (error) {
            alert('אירעה שגיאה: ' + error.message);
        }
    }

    // הוספת מאזינים לכפתורים
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', submitForm);
    }
});