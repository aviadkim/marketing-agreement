// Firebase Configuration and Initialization
console.log('[DEBUG] Starting Firebase configuration');

window.firebaseConfig = {
    apiKey: "AIzaSyBlrfwQJmkUSnqoNZp3bxfH9DH0QuuJtMs",
    authDomain: "client-d5bfe.firebaseapp.com",
    projectId: "client-d5bfe",
    storageBucket: "client-d5bfe.firebasestorage.app",
    messagingSenderId: "678297464867",
    appId: "1:678297464867:web:2c929a45d2e9f0cdb68196"
};

class FirebaseService {
    constructor() {
        if (window.firebaseService) {
            return window.firebaseService;
        }
        window.firebaseService = this;
        this.initialize();
    }

    async initialize() {
        if (!firebase.apps?.length) {
            try {
                firebase.initializeApp(window.firebaseConfig);
                console.log('[DEBUG] Firebase initialized successfully');

                window.db = firebase.firestore();
                window.storage = firebase.storage();
                
                firebase.firestore.setLogLevel('debug');

                await this.testConnection();
                window.dispatchEvent(new CustomEvent('firebase-ready'));
            } catch (error) {
                console.error('[ERROR] Firebase initialization failed:', error);
                window.dispatchEvent(new CustomEvent('firebase-error', { detail: error }));
            }
        } else {
            console.log('[DEBUG] Firebase already initialized');
        }
    }

    async testConnection() {
        try {
            const ref = await window.db.collection('test').add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                test: 'Connection test'
            });
            console.log('[DEBUG] Firebase connection test successful');
            await ref.delete();  // Cleanup test document
        } catch (error) {
            console.error('[ERROR] Firebase connection test failed:', error);
            throw error;
        }
    }

    isReady() {
        return firebase.apps?.length > 0 && window.db && window.storage;
    }

    waitForReady() {
        return new Promise((resolve, reject) => {
            if (this.isReady()) {
                resolve();
            } else {
                window.addEventListener('firebase-ready', resolve);
                window.addEventListener('firebase-error', reject);
                setTimeout(() => reject(new Error('Firebase initialization timeout')), 10000);
            }
        });
    }

    async saveForm(formData) {
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
    }

    async uploadFile(file, path) {
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
    }
}

// Initialize Firebase service and expose to window
window.firebaseService = new FirebaseService();
window.firebaseHelpers = {
    isReady: () => window.firebaseService.isReady(),
    waitForReady: () => window.firebaseService.waitForReady(),
    saveForm: (data) => window.firebaseService.saveForm(data),
    uploadFile: (file, path) => window.firebaseService.uploadFile(file, path)
};
