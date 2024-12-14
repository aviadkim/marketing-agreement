// public/js/firebaseConfig.js
console.log('[DEBUG] Starting Firebase configuration');

const firebaseConfig = {
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
        firebase.initializeApp(firebaseConfig);
        console.log('[DEBUG] Firebase initialized successfully');
        
        window.db = firebase.firestore();
        window.storage = firebase.storage();
        
        firebase.firestore.setLogLevel('debug');
        
        // טסט חיבור
        db.collection('test').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            test: 'Connection test'
        })
        .then(() => console.log('[DEBUG] Firebase connection test successful'))
        .catch(error => console.error('[ERROR] Firebase connection test failed:', error));
        
    } catch (error) {
        console.error('[ERROR] Firebase initialization failed:', error);
    }
}
