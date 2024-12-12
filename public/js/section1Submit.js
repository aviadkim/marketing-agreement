firebase.initializeApp({
  apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
  authDomain: "client-d5bfe.firebaseapp.com",
  projectId: "client-d5bfe",
  storageBucket: "client-d5bfe.appspot.com",
  messagingSenderId: "678297464867",
  appId: "1:678297464867:web:2c929a45d2e9f0cdb68196"
});

const db = firebase.firestore();

async function submitForm(e) {
    e.preventDefault();
    console.log('[DEBUG] Starting form submission');

    const submitButton = document.getElementById('saveAndContinue');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');

    try {
        console.log('[DEBUG] Disabling button');
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        // Get form data
        console.log('[DEBUG] Getting form data');
        const form = document.querySelector('form');
        const formData = new FormData(form);

        // Create screenshot
        console.log('[DEBUG] Creating screenshot');
        const formElement = document.querySelector('.form-card');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        console.log('[DEBUG] Screenshot created');

        // Convert to base64
        const screenshot = canvas.toDataURL('image/png', 1.0);
        console.log('[DEBUG] Converting to base64');

        // Save to Firestore
        console.log('[DEBUG] Saving to Firestore');
        await db.collection('forms').add({
            section: "1",
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            screenshot: screenshot,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('[DEBUG] Saved to Firestore successfully');

        // Save to localStorage
        localStorage.setItem('formData', JSON.stringify({
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone')
        }));
        console.log('[DEBUG] Saved to localStorage');

        showMessage('הטופס נשלח בהצלחה', 'success');

        // Navigate to next section
        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 500);

    } catch (error) {
        console.error('[ERROR] Submit failed:', error);
        showMessage("שגיאה בשליחת הטופס: " + error.message);
    } finally {
        submitButton.disabled = false;
        buttonText.style.opacity = '1';
        buttonLoader.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Page loaded');
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        console.log('[DEBUG] Submit button found');
        submitButton.addEventListener('click', submitForm);
    } else {
        console.error('[ERROR] Submit button not found');
    }
});
