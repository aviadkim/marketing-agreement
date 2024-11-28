document.addEventListener('DOMContentLoaded', function() {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');
    const backButton = document.getElementById('btnBack');

    // פונקציה לניווט לעמוד הבא
    function navigateToNext() {
        if (!validateForm()) return; // בודק אם הטופס תקין

        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();

        const routes = {
            'index.html': '/sections/section2.html',
            'section1.html': '/sections/section2.html',
            'section2.html': '/sections/section3.html',
            'section3.html': '/sections/section4.html',
            'section4.html': '/sections/preview.html',
            'preview.html': '/sections/thank-you.html'
        };

        const nextPage = routes[currentPage];

        if (nextPage) {
            window.location.href = nextPage;
        } else {
            console.error('לא נמצא העמוד הבא עבור:', currentPage);
        }
    }

    // פונקציה לחזור לעמוד הקודם
    function goBack() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();

        const routes = {
            'section2.html': '/index.html',
            'section3.html': '/sections/section2.html',
            'section4.html': '/sections/section3.html',
            'preview.html': '/sections/section4.html',
            'thank-you.html': '/sections/preview.html'
        };

        const prevPage = routes[currentPage];

        if (prevPage) {
            window.location.href = prevPage;
        } else {
            console.error('לא נמצא העמוד הקודם עבור:', currentPage);
        }
    }

    // מאזינים לאירועים
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', navigateToNext);
    }

    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            goBack();
        });
    }
});
