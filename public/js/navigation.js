document.addEventListener('DOMContentLoaded', function () {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');
    const backButton = document.getElementById('btnBack');

    // אובייקט הנתיבים עם כתובות URL מלאות
    const routes = {
        'index.html': 'https://marketing-agreement-production.up.railway.app/sections/section1.html',
        'section1.html': 'https://marketing-agreement-production.up.railway.app/sections/section2.html',
        'section2.html': 'https://marketing-agreement-production.up.railway.app/sections/section3.html',
        'section3.html': 'https://marketing-agreement-production.up.railway.app/sections/section4.html',
        'section4.html': 'https://marketing-agreement-production.up.railway.app/sections/thank-you.html',
        'preview.html': 'https://marketing-agreement-production.up.railway.app/sections/thank-you.html',
    };

    // פונקציית מעבר לעמוד הבא
    function navigateToNext() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();

        const nextPage = routes[currentPage];

        if (nextPage) {
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
            'section1.html': 'https://marketing-agreement-production.up.railway.app/index.html',
            'section2.html': 'https://marketing-agreement-production.up.railway.app/sections/section1.html',
            'section3.html': 'https://marketing-agreement-production.up.railway.app/sections/section2.html',
            'section4.html': 'https://marketing-agreement-production.up.railway.app/sections/section3.html',
            'thank-you.html': 'https://marketing-agreement-production.up.railway.app/sections/section4.html',
        };

        const prevPage = prevRoutes[currentPage];

        if (prevPage) {
            window.location.href = prevPage;
        } else {
            showError(`לא נמצא העמוד הקודם עבור: ${currentPage}`);
        }
    }

    // פונקציה להצגת הודעת שגיאה
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

    // מאזיני אירועים לכפתורים
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', navigateToNext);
    }

    if (backButton) {
        backButton.addEventListener('click', function (e) {
            e.preventDefault();
            goBack();
        });
    }

    // ניווט באמצעות מקלדת
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.ctrlKey && saveAndContinue) {
            navigateToNext();
        }
    });
});
