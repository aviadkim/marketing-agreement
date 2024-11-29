document.addEventListener('DOMContentLoaded', function() {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');
    const backButton = document.getElementById('btnBack');

    // פונקציית מעבר לעמוד הבא
    function navigateToNext() {
        const form = document.querySelector('form');
        const formId = form.id;
        console.log("Current form ID:", formId);

        let nextPage;
        switch(formId) {
            case 'section1-form':
                nextPage = 'section2.html';
                break;
            case 'section2-form':
                nextPage = 'section3.html';  // הסרנו את sections/
                break;
            case 'section3-form':
                nextPage = 'section4.html';
                break;
            case 'section4-form':
                nextPage = 'thank-you.html';
                break;
            default:
                console.error('Unknown form ID:', formId);
                showError('שגיאה בניווט');
                return;
        }

        // Save form data before navigation
        if (typeof saveFormData === 'function') {
            saveFormData();
        }

        console.log("Navigating to:", nextPage);
        window.location.href = nextPage;
    }

    // פונקציית חזרה אחורה
    function goBack() {
        const form = document.querySelector('form');
        const formId = form.id;
        
        let prevPage;
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

        if (typeof saveFormData === 'function') {
            saveFormData();
        }

        window.location.href = prevPage;
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

    // Event listeners
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', submitForm);
    }

    if (backButton) {
        backButton.addEventListener('click', goBack);
    }
});
