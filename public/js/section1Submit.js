// section1Submit.js
console.log('[DEBUG] Script started loading');

const firebaseConfig = {
    apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
    authDomain: "client-d5bfe.firebaseapp.com",
    projectId: "client-d5bfe",
    storageBucket: "client-d5bfe.firebasestorage.app", // שינוי לכתובת הנכונה
    messagingSenderId: "678297464867",
    appId: "1:678297464867:web:2c929a45d2e9f0cdb68196"
};

try {
    firebase.initializeApp(firebaseConfig);
    console.log('[DEBUG] Firebase initialized');
    
    const db = firebase.firestore();
    const storage = firebase.storage();
    firebase.firestore.setLogLevel('debug');
} catch (error) {
    console.error('[ERROR] Firebase initialization failed:', error);
}

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

        // Get form data
        const form = document.querySelector('form');
        if (!form) throw new Error('Form element not found');
        const formData = new FormData(form);

        // Create PDF
        console.log('[DEBUG] Creating PDF');
        const formElement = document.querySelector('.form-card');
        if (!formElement) throw new Error('Form card element not found');

        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        // Convert to PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Convert PDF to blob
        const pdfBlob = pdf.output('blob');
        
        // Upload to Firebase Storage
        console.log('[DEBUG] Uploading PDF to Storage');
        const metadata = {
            contentType: 'application/pdf',
            customMetadata: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            }
        };

        const fileName = `forms/section1_${Date.now()}.pdf`;
        const storageRef = firebase.storage().ref().child(fileName);
        const uploadTask = await storageRef.put(pdfBlob, metadata);
        const pdfUrl = await uploadTask.ref.getDownloadURL();
        console.log('[DEBUG] PDF uploaded successfully:', pdfUrl);

        // Save to Firestore
        const docData = {
            section: "1",
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            pdfUrl: pdfUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'completed'
        };

        const docRef = await db.collection('forms').add(docData);
        console.log('[DEBUG] Saved to Firestore:', docRef.id);

        // Save to localStorage
        localStorage.setItem('formData', JSON.stringify({
            formId: docRef.id,
            ...docData
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

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', submitForm);
    }
});
