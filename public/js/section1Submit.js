// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
  authDomain: "client-d5bfe.firebaseapp.com",
  projectId: "client-d5bfe",
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
        // UI updates
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        // Get form data
        const form = document.querySelector('form');
        const formData = new FormData(form);
        
        // Save to Firestore
        console.log('[DEBUG] Saving to Firestore');
        await db.collection('forms').add({
            section: "1",
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            timestamp: new Date().toISOString()
        });
        console.log('[DEBUG] Save successful');

        // Save to localStorage
        localStorage.setItem('formData', JSON.stringify({
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone')
        }));

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

function showMessage(message, type = "error") {
    const div = document.createElement("div");
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
        background: ${type === "success" ? "#4CAF50" : "#dc3545"};
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Section 1 initialized');
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        console.log('[DEBUG] Found submit button');
        submitButton.addEventListener('click', submitForm);
    } else {
        console.error('[ERROR] Submit button not found');
    }
});
