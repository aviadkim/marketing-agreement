// navigation.js

document.addEventListener('DOMContentLoaded', function() {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');
    const backButton = document.getElementById('btnBack');

    // Navigation functions
    function navigateToNext() {
        if (!validateForm()) return;

        saveFormData();

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
            showError('לא נמצא העמוד הבא');
        }
    }

    function goBack() {
        saveFormData();

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
            showError('לא נמצא העמוד הקודם');
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
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            goBack();
        });
    }

    // Handle keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey && saveAndContinue) {
            navigateToNext();
        }
    });

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
                window.location.href = '/sections/thank-you.html';
            } else {
                throw new Error('שגיאה בשליחת הטופס');
            }
        } catch (error) {
            showError('אירעה שגיאה בשליחת הטופס: ' + error.message);
        }
    }
});
