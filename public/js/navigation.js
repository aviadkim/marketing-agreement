document.addEventListener('DOMContentLoaded', function() {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const backButton = document.getElementById('btnBack');

    // פונקציה לניווט לעמוד הבא
    function navigateToNext() {
        const routes = {
            'index.html': '/sections/section2.html',
            'section1.html': '/sections/section2.html',
            'section2.html': '/sections/section3.html',
            'section3.html': '/sections/section4.html',
            'section4.html': '/sections/preview.html',
            'preview.html': '/sections/thank-you.html'
        };

        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();

        const nextPage = routes[currentPage] || null;

        if (nextPage) {
            console.log('מעבר לעמוד הבא:', nextPage);
            window.location.href = nextPage;
        } else {
            console.error('לא נמצא העמוד הבא עבור:', currentPage);
        }
    }

    // פונקציה לחזור לעמוד הקודם
    function goBack() {
        const routes = {
            'section2.html': '/index.html',
            'section3.html': '/sections/section2.html',
            'section4.html': '/sections/section3.html',
            'preview.html': '/sections/section4.html',
            'thank-you.html': '/sections/preview.html'
        };

        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();

        const prevPage = routes[currentPage] || null;

        if (prevPage) {
            console.log('חזרה לעמוד הקודם:', prevPage);
            window.location.href = prevPage;
        } else {
            console.error('לא נמצא העמוד הקודם עבור:', currentPage);
        }
    }

    // האזנה לאירועים
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', function() {
            navigateToNext();
        });
    }

    if (backButton) {
        backButton.addEventListener('click', function() {
            goBack();
        });
    }
});
