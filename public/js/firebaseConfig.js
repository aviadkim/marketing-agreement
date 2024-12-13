// public/js/firebaseConfig.js
console.log('[DEBUG] Starting Firebase configuration');

const firebaseConfig = {
    apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
    authDomain: "client-d5bfe.firebaseapp.com",
    projectId: "client-d5bfe",
    storageBucket: "client-d5bfe.appspot.com",
    messagingSenderId: "678297464867",
    appId: "1:678297464867:web:2c929a45d2e9f0cdb68196"
};

try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('[DEBUG] Firebase initialized successfully');

    // Initialize Firestore with debug logging
    window.db = firebase.firestore();
    firebase.firestore.setLogLevel('debug');

    // Initialize Storage with debug logging
    window.storage = firebase.storage();
    storage.setLogLevel('debug');

    // Test connection
    db.collection('test').add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        test: 'Connection test'
    })
    .then(() => console.log('[DEBUG] Firebase connection test successful'))
    .catch(error => console.error('[ERROR] Firebase connection test failed:', error));

} catch (error) {
    console.error('[ERROR] Firebase initialization failed:', error);
}
