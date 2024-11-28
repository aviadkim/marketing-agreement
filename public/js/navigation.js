document.addEventListener('DOMContentLoaded', function () {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');
    const backButton = document.getElementById('btnBack');

    // פונקציית מעבר לעמוד הבא
    function navigateToNext() {
        // בדיקת תקינות הטופס
        const form = document.querySelector('form');
        if (form) {
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
                return;
            }
        }

        // מציאת העמוד הבא
        const currentPath = window.location.pathname;
        const currentPage = currentPath.includes('sections/') ? 
            currentPath.split('sections/')[1] : 
            currentPath.split('/').pop();

        console.log('Current page:', currentPage);

        // מיפוי נתיבים מדויק
        const nextPage = (() => {
            switch (currentPage) {
                case 'section1.html':
                    return '/sections/section2.html';
                case 'section2.html':
                    return '/sections/section3.html';
                case 'section3.html':
                    return '/sections/section4.html';
                case 'section4.html':
                    return '/sections/thank-you.html';
                default:
                    return null;
            }
        })();

        if (nextPage) {
            // שמירת נתונים לפני מעבר
            if (typeof saveFormData === 'function') {
                saveFormData();
            }
            window.location.href = nextPage;
        } else {
            showError(`לא נמצא העמוד הבא עבור: ${currentPage}`);
            console.error('Current path:', currentPath);
            console.error('Current page:', currentPage);
        }
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

    // הוספת מאזינים לכפתורים
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', navigateToNext);
    }
});
