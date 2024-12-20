// Firebase Configuration and Initialization
console.log('[DEBUG] Starting Firebase configuration');

const firebaseConfig = {
    apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
    authDomain: "client-d5bfe.firebaseapp.com",
    projectId: "client-d5bfe",
    storageBucket: "client-d5bfe.firebasestorage.app",
    messagingSenderId: "678297464867",
    appId: "1:678297464867:web:2c929a45d2e9f0cdb68196"
};

// Prevent multiple initializations
if (!firebase.apps?.length) {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        console.log('[DEBUG] Firebase initialized successfully');

        // Initialize Firestore with logging
        window.db = firebase.firestore();
        firebase.firestore.setLogLevel('debug');

        // Initialize Storage
        window.storage = firebase.storage();

        // Test connection
        window.db.collection('test').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            test: 'Connection test'
        })
        .then(() => {
            console.log('[DEBUG] Firebase connection test successful');
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

// Helper Functions
const isFirebaseReady = () => {
    return firebase.apps?.length > 0 && window.db && window.storage;
};

const waitForFirebase = () => {
    return new Promise((resolve, reject) => {
        if (isFirebaseReady()) {
            resolve();
        } else {
            window.addEventListener('firebase-ready', resolve);
            window.addEventListener('firebase-error', reject);
            // Timeout after 10 seconds
            setTimeout(() => reject(new Error('Firebase initialization timeout')), 10000);
        }
    });
};

// Save form data to Firestore
const saveToFirestore = async (formData) => {
    try {
        const docRef = await window.db.collection('forms').add({
            ...formData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'submitted'
        });
        console.log('[DEBUG] Form saved to Firestore:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('[ERROR] Firestore save failed:', error);
        throw error;
    }
};

// Upload file to Storage
const uploadToStorage = async (file, path) => {
    try {
        const ref = window.storage.ref(path);
        await ref.put(file);
        const url = await ref.getDownloadURL();
        console.log('[DEBUG] File uploaded to Storage:', url);
        return url;
    } catch (error) {
        console.error('[ERROR] Storage upload failed:', error);
        throw error;
    }
};

// Export functions
window.firebaseHelpers = {
    isReady: isFirebaseReady,
    waitForReady: waitForFirebase,
    saveForm: saveToFirestore,
    uploadFile: uploadToStorage
};
