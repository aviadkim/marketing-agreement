// Initialize Firebase
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
    
    const submitButton = document.getElementById('saveAndContinue');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');
    
    try {
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        // Get form data
        const form = document.querySelector('form');
        const formData = new FormData(form);
        
        // Create form screenshot
        const formElement = document.querySelector('.form-card');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        
        // Convert to base64
        const screenshot = canvas.toDataURL('image/png', 1.0);
        
        // Save to Firestore
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

        // Save to localStorage for next sections
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
