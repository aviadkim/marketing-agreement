// קובץ section1Submit.js מלא עם שינויים מודגשים בהערות
console.log('[DEBUG] Script started loading');

const firebaseConfig = {
    apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
    authDomain: "client-d5bfe.firebaseapp.com",
    projectId: "client-d5bfe",
    storageBucket: "client-d5bfe.firebasestorage.app",
    messagingSenderId: "678297464867",
    appId: "1:678297464867:web:2c929a45d2e9f0cdb68196"
};

// ייצוא הפונקציות לשימוש גלובלי
window.db = null;
window.storage = null;

try {
    firebase.initializeApp(firebaseConfig);
    console.log('[DEBUG] Firebase initialized');
    
    window.db = firebase.firestore();
    window.storage = firebase.storage();
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
        // UI עדכון
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        // קבלת נתוני הטופס
        const form = document.querySelector('form');
        if (!form) throw new Error('Form element not found');
        const formData = new FormData(form);

        // יצירת PDF
        console.log('[DEBUG] Starting PDF creation');
        const formElement = document.querySelector('.form-card');
        if (!formElement) throw new Error('Form card element not found');

        // יצירת canvas
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true
        });
        console.log('[DEBUG] Canvas created');

        // המרה ל-PDF
        console.log('[DEBUG] Converting to PDF');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // חישוב יחס גובה-רוחב
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

        // המרה ל-blob להעלאה
        const pdfBlob = pdf.output('blob');
        console.log('[DEBUG] PDF created, size:', pdfBlob.size);

        // העלאה ל-Firebase Storage
        console.log('[DEBUG] Starting PDF upload');
        const fileName = `forms/section1_${Date.now()}.pdf`;
        const storageRef = storage.ref().child(fileName);
        const uploadTask = await storageRef.put(pdfBlob, {
            contentType: 'application/pdf',
            customMetadata: {
                formSection: '1',
                timestamp: new Date().toISOString()
            }
        });

        const pdfUrl = await uploadTask.ref.getDownloadURL();
        console.log('[DEBUG] PDF uploaded successfully:', pdfUrl);

        // שמירה ב-Firestore
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

        // שמירה ב-localStorage
        localStorage.setItem('formData', JSON.stringify({
            formId: docRef.id,
            ...docData
        }));

        // להוסיף:
        console.log('[DEBUG] Section 1 localStorage saved:', JSON.parse(localStorage.getItem('formData')));

        showMessage('הטופס נשלח בהצלחה', 'success');
        console.log('[DEBUG] Form submitted successfully');

        // מעבר לסקשן הבא רק אחרי שכל התהליך הסתיים
        setTimeout(() => {
            console.log('[DEBUG] Navigating to next section');
            window.location.href = '/sections/section2.html';
        }, 2000); // נותן קצת יותר זמן

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

// אתחול והוספת event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Section 1 loaded. Testing required features:');
    console.log('- jsPDF available:', typeof window.jspdf !== 'undefined');
    console.log('- html2canvas available:', typeof html2canvas !== 'undefined');
    console.log('- Firebase available:', typeof firebase !== 'undefined');
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.onclick = submitForm;  // שימוש ישיר בפונקציה
        console.log('[DEBUG] Submit button handler attached');
    } else {
        console.error('[ERROR] Submit button not found');
    }
});
