// test-system.js - שים אותו בתיקיית public/js
console.log('[DEBUG] Starting system test');

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
} catch (error) {
    console.error('[DEBUG] Firebase initialization error:', error);
}

// בדיקת מערכת
function testSystem() {
    console.log('=== בדיקת טעינת ספריות ===');
    console.log({
        jspdf: typeof window.jspdf,
        html2canvas: typeof html2canvas,
        firebase: typeof firebase,
        jsPDF: typeof window.jsPDF
    });

    // בדיקת Firebase
    if (typeof firebase !== 'undefined') {
        console.log('[TEST] Testing Firebase connection');
        const db = firebase.firestore();
        db.collection('test').add({
            test: true,
            timestamp: new Date()
        })
        .then(doc => {
            console.log('[TEST] Firebase test successful, doc ID:', doc.id);
            showMessage('בדיקת Firebase הצליחה', 'success');
        })
        .catch(err => {
            console.error('[TEST] Firebase test failed:', err);
            showMessage('בדיקת Firebase נכשלה: ' + err.message, 'error');
        });
    }

    // בדיקת PDF
    if (typeof window.jspdf !== 'undefined') {
        try {
            console.log('[TEST] Testing PDF creation');
            const doc = new window.jspdf.jsPDF();
            doc.text('בדיקה', 10, 10);
            const blob = doc.output('blob');
            console.log('[TEST] PDF test successful, size:', blob.size);
            showMessage('בדיקת PDF הצליחה', 'success');
        } catch (err) {
            console.error('[TEST] PDF test failed:', err);
            showMessage('בדיקת PDF נכשלה: ' + err.message, 'error');
        }
    }
}

// הוספת כפתור בדיקה
function addTestButton() {
    const button = document.createElement('button');
    button.innerHTML = 'בדיקת מערכת';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9999;
    `;
    button.onclick = testSystem;
    document.body.appendChild(button);
}

// הוספת פונקציית הודעה
function showMessage(message, type = 'info') {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// הפעלה בטעינת הדף
document.addEventListener('DOMContentLoaded', addTestButton);
