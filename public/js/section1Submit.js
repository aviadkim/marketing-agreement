// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
    authDomain: "client-d5bfe.firebaseapp.com",
    projectId: "client-d5bfe",
    storageBucket: "client-d5bfe.appspot.com",
    messagingSenderId: "678297464867",
    appId: "1:678297464867:web:2c929a45d2e9f0cdb68196"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function submitForm(e) {
    e.preventDefault();
    console.log('[DEBUG] Starting form submission');

    const submitButton = document.getElementById('saveAndContinue');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');

    try {
        // Update UI
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';
        console.log('[DEBUG] Button disabled');

        // Get form data
        const form = document.querySelector('form');
        const formData = new FormData(form);
        console.log('[DEBUG] Form data collected');

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
        console.log('[DEBUG] Screenshot converted to base64');

        // Create document data
        const docData = {
            section: "1",
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            screenshot: screenshot,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Save to Firestore
        console.log('[DEBUG] Saving to Firestore');
        await db.collection('forms').add(docData);
        console.log('[DEBUG] Saved to Firestore successfully');

        // Save to localStorage
        localStorage.setItem('formData', JSON.stringify({
            firstName: docData.firstName,
            lastName: docData.lastName,
            idNumber: docData.idNumber,
            email: docData.email,
            phone: docData.phone
        }));
        console.log('[DEBUG] Saved to localStorage');

        showMessage('הטופס נשלח בהצלחה', 'success');

        // Navigate to next section
        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 1000);

    } catch (error) {
        console.error('[ERROR] Submit failed:', error);
        showMessage("שגיאה בשליחת הטופס: " + error.message);
    } finally {
        submitButton.disabled = false;
        buttonText.style.opacity = '1';
        buttonLoader.style.display = 'none';
    }
}

function showMessage(message, type = 'error') {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = message;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        color: white;
        background: ${type === 'success' ? '#4CAF50' : '#dc3545'};
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Page loaded');
    
    // Test Firebase connection
    db.collection('forms').get()
        .then(() => console.log('[DEBUG] Firebase connection successful'))
        .catch(error => console.error('[ERROR] Firebase connection failed:', error));
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', submitForm);
        console.log('[DEBUG] Submit button handler attached');
    }
});
