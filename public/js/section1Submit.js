console.log('[DEBUG] Script started loading');

const firebaseConfig = {
    apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
    authDomain: "client-d5bfe.firebaseapp.com",
    projectId: "client-d5bfe",
    storageBucket: "client-d5bfe.firebasestorage.app",
    messagingSenderId: "678297464867",
    appId: "1:678297464867:web:2c929a45d2e9f0cdb68196"
};

try {
    firebase.initializeApp(firebaseConfig);
    console.log('[DEBUG] Firebase initialized');
    
    const db = firebase.firestore();
    const storage = firebase.storage();
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
        console.log('[DEBUG] Starting PDF creation');
        const formElement = document.querySelector('.form-card');
        if (!formElement) throw new Error('Form card element not found');

        // First create canvas
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true
        });
        console.log('[DEBUG] Canvas created');

        // Convert to PDF
        console.log('[DEBUG] Converting to PDF');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate dimensions to maintain aspect ratio
        const ratio = canvas.width / canvas.height;
        let width = pageWidth;
        let height = width / ratio;
        if (height > pageHeight) {
            height = pageHeight;
            width = height * ratio;
        }

        pdf.addImage(imgData, 'PNG', 
            (pageWidth - width) / 2,
            0,
            width, 
            height
        );

        // Convert to blob for upload
        const pdfBlob = pdf.output('blob');
        console.log('[DEBUG] PDF created, size:', pdfBlob.size);

        // Upload to Firebase Storage
        console.log('[DEBUG] Starting PDF upload');
        const fileName = `forms/section1_${Date.now()}.pdf`;
        const storageRef = firebase.storage().ref().child(fileName);
        const uploadTask = await storageRef.put(pdfBlob, {
            contentType: 'application/pdf',
            customMetadata: {
                formSection: '1',
                timestamp: new Date().toISOString()
            }
        });

        const pdfUrl = await uploadTask.ref.getDownloadURL();
        console.log('[DEBUG] PDF uploaded successfully');

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
        console.log('[DEBUG] Form submitted successfully');

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
    console.log('[DEBUG] Page loaded, checking PDF library');
    if (typeof jsPDF === 'undefined') {
        console.error('[ERROR] jsPDF library not loaded');
    }
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', submitForm);
        console.log('[DEBUG] Submit button handler attached');
    } else {
        console.error('[ERROR] Submit button not found');
    }
});
