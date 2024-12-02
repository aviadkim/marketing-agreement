document.addEventListener('DOMContentLoaded', function () {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');

    function saveFormData() {
        const form = document.querySelector('form');
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // שמור חתימה אם קיימת
        const signaturePadCanvas = document.querySelector('#signatureCanvas');
        if (signaturePadCanvas && typeof signaturePadCanvas.toDataURL === 'function') {
            const signatureData = new SignaturePad(signaturePadCanvas).toDataURL();
            data.signature = signatureData;
        }

        localStorage.setItem('formData', JSON.stringify(data));
        console.log('Form data saved to LocalStorage');
    }

    function navigateToNext() {
        saveFormData();

        const currentPath = window.location.pathname;
        let nextPage;

        if (currentPath.includes('section1')) {
            nextPage = '/sections/section2.html';
        } else if (currentPath.includes('section2')) {
            nextPage = '/sections/section3.html';
        } else if (currentPath.includes('section3')) {
            nextPage = '/sections/section4.html';
        } else {
            console.error('Unknown navigation path');
            return;
        }

        console.log('Navigating to:', nextPage);
        window.location.href = nextPage;
    }

    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }
});
