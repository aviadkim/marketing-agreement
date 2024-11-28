document.addEventListener('DOMContentLoaded', function () {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');
    const backButton = document.getElementById('btnBack');

    // אובייקט הנתיבים עם נתיבים יחסיים
    const routes = {
        'index.html': 'sections/section1.html',
        'section1.html': 'section2.html',
        'section2.html': 'section3.html',
        'section3.html': 'section4.html',
        'section4.html': 'thank-you.html'
    };

    // פונקציית מעבר לעמוד הבא
    function navigateToNext() {
        if (!validateForm()) return;
        
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();
        console.log('Current page:', currentPage); // לדיבוג
        
        const nextPage = routes[currentPage];
        if (nextPage) {
            saveFormData(); // שמירת הנתונים לפני המעבר
            window.location.href = nextPage;
        } else {
            showError(`לא נמצא העמוד הבא עבור: ${currentPage}`);
        }
    }

    // פונקציית חזרה לעמוד הקודם
    function goBack() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();
        
        const prevRoutes = {
            'section1.html': 'index.html',
            'section2.html': 'section1.html',
            'section3.html': 'section2.html',
            'section4.html': 'section3.html'
        };
        
        const prevPage = prevRoutes[currentPage];
        if (prevPage) {
            saveFormData(); // שמירת הנתונים לפני החזרה
            window.location.href = prevPage;
        }
    }

    // בדיקת תקינות הטופס
    function validateForm() {
        const form = document.querySelector('form');
        if (!form) return true;
        
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

    // מאזיני אירועים
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', navigateToNext);
    }

    if (backButton) {
        backButton.addEventListener('click', goBack);
    }
});
