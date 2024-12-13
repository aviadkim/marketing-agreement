// section1Submit.js - קובץ מלא
console.log('[DEBUG] Script started loading');

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
console.log('[DEBUG] Starting Firebase initialization');
try {
    firebase.initializeApp(firebaseConfig);
    console.log('[DEBUG] Firebase initialized successfully');
} catch (error) {
    console.error('[ERROR] Firebase initialization failed:', error);
}

let db;
try {
    db = firebase.firestore();
    firebase.firestore.setLogLevel('debug');  // הוספת שורה זו לדיבוג
    console.log('[DEBUG] Firestore instance created successfully');
} catch (error) {
    console.error('[ERROR] Failed to create Firestore instance:', error);
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
        console.log('[DEBUG] Button disabled');

        // Test Firebase connection first
        console.log('[DEBUG] Testing Firebase connection...');
        const testDoc = await db.collection('test').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            test: 'Connection test'
        });
        console.log('[DEBUG] Firebase connection test successful:', testDoc.id);

        // Get form data
        const form = document.querySelector('form');
        if (!form) {
            throw new Error('Form element not found');
        }
        const formData = new FormData(form);
        console.log('[DEBUG] Form data collected:', 
            Object.fromEntries(formData.entries()));

        // Create screenshot
        console.log('[DEBUG] Starting screenshot creation');
        const formElement = document.querySelector('.form-card');
        if (!formElement) {
            throw new Error('Form card element not found');
        }
        
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true
        });
        console.log('[DEBUG] Screenshot created successfully');

        // Convert to base64
        const screenshot = canvas.toDataURL('image/png', 1.0);
        console.log('[DEBUG] Screenshot converted to base64');

        // Upload screenshot to Storage first
        console.log('[DEBUG] Starting screenshot upload to Storage');
        const storageRef = firebase.storage().ref();
        const screenshotRef = storageRef.child(`screenshots/section1_${Date.now()}.png`);
        const uploadTask = await screenshotRef.putString(screenshot, 'data_url');
        const screenshotUrl = await uploadTask.ref.getDownloadURL();
        console.log('[DEBUG] Screenshot uploaded successfully:', screenshotUrl);

        // Create document data
        const docData = {
            section: "1",
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            screenshotUrl: screenshotUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'completed'
        };
        console.log('[DEBUG] Document data prepared:', {
            ...docData,
            screenshotUrl: 'url_removed_from_log'
        });

        // Save to Firestore
        console.log('[DEBUG] Starting Firestore save');
        const docRef = await db.collection('forms').add(docData);
        console.log('[DEBUG] Saved to Firestore successfully, ID:', docRef.id);

        // Save to localStorage
        const localStorageData = {
            firstName: docData.firstName,
            lastName: docData.lastName,
            idNumber: docData.idNumber,
            email: docData.email,
            phone: docData.phone,
            formId: docRef.id
        };
        localStorage.setItem('formData', JSON.stringify(localStorageData));
        console.log('[DEBUG] Saved to localStorage:', localStorageData);

        showMessage('הטופס נשלח בהצלחה', 'success');
        console.log('[DEBUG] Success message shown');

        // Navigate to next section
        console.log('[DEBUG] Starting navigation to section 2');
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
        console.log('[DEBUG] Button re-enabled');
    }
}

function showMessage(message, type = 'error') {
    console.log(`[${type.toUpperCase()}] Showing message:`, message);
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
    console.log('[DEBUG] Page loaded, starting initialization');
    
    // Test Firebase connection
    if (db) {
        console.log('[DEBUG] Testing Firebase connection');
        db.collection('forms').get()
            .then(() => {
                console.log('[DEBUG] Firebase connection successful');
            })
            .catch(error => {
                console.error('[ERROR] Firebase connection failed:', error);
            });
    } else {
        console.error('[ERROR] Firestore instance not available');
    }
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', submitForm);
        console.log('[DEBUG] Submit button handler attached');
    } else {
        console.error('[ERROR] Submit button not found');
    }
    
    console.log('[DEBUG] Initialization complete');
});
