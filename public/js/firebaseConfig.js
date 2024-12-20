// public/js/firebaseConfig.js

console.log('[DEBUG] Starting Firebase configuration');

// בדיקה אם כבר הוגדר
if (window.firebaseConfig) {
    console.log('[DEBUG] Firebase already configured');
} else {
    window.firebaseConfig = {
        apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
        authDomain: "client-d5bfe.firebaseapp.com",
        projectId: "client-d5bfe",
        storageBucket: "client-d5bfe.firebasestorage.app",
        messagingSenderId: "678297464867",
        appId: "1:678297464867:web:2c929a45d2e9f0cdb68196"
    };

    // בדיקה אם Firebase כבר אותחל
    if (!firebase.apps?.length) {
        try {
            firebase.initializeApp(window.firebaseConfig);
            console.log('[DEBUG] Firebase initialized successfully');
            
            // הגדרת משתנים גלובליים
            window.db = firebase.firestore();
            window.storage = firebase.storage();
            
            // הגדרת רמת לוגים
            firebase.firestore.setLogLevel('debug');
            
            // בדיקת חיבור
            window.db.collection('test').add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                test: 'Connection test'
            })
            .then(() => {
                console.log('[DEBUG] Firebase connection test successful');
                // שליחת אירוע שהחיבור הצליח
                window.dispatchEvent(new CustomEvent('firebase-ready'));
            })
            .catch(error => {
                console.error('[ERROR] Firebase connection test failed:', error);
                window.dispatchEvent(new CustomEvent('firebase-error', { detail: error }));
            });
            
        } catch (error) {
            console.error('[ERROR] Firebase initialization failed:', error);
            window.dispatchEvent(new CustomEvent('firebase-error', { detail: error }));
        }
    } else {
        console.log('[DEBUG] Firebase already initialized');
    }
}

// פונקציות עזר
window.isFirebaseReady = () => {
    return firebase.apps?.length > 0 && window.db && window.storage;
};

window.waitForFirebase = () => {
    return new Promise((resolve, reject) => {
        if (window.isFirebaseReady()) {
            resolve();
        } else {
            window.addEventListener('firebase-ready', resolve);
            window.addEventListener('firebase-error', reject);
        }
    });
};

// ייצוא לשימוש
export { firebase, window.db as db, window.storage as storage };
