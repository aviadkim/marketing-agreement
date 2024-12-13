// test-firebase-connection.js
console.log('[TEST] Starting Firebase connection test');

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
try {
    firebase.initializeApp(firebaseConfig);
    console.log('[TEST] Firebase initialized');
} catch (error) {
    console.error('[TEST] Firebase initialization error:', error);
}

// Test Firestore connection
async function testConnection() {
    try {
        const db = firebase.firestore();
        
        // נסיון לשמור מסמך בדיקה
        const testDoc = await db.collection('test-connection').add({
            message: "Test connection from Visual Studio Code",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            testId: `test_${Date.now()}`
        });
        
        console.log('[TEST] Document written successfully with ID:', testDoc.id);
        
        // נסיון לקרוא את המסמך שנשמר
        const docData = await db.collection('test-connection').doc(testDoc.id).get();
        console.log('[TEST] Document read successfully:', docData.data());
        
        return true;
    } catch (error) {
        console.error('[TEST] Connection test failed:', error);
        return false;
    }
}

// Run test
testConnection().then(success => {
    if (success) {
        console.log('[TEST] All connection tests passed successfully');
    } else {
        console.log('[TEST] Connection test failed');
    }
});
