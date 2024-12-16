async function submitForm(e) {
    e.preventDefault();
    console.log('[DEBUG] Starting section 2 submission');

    const submitButton = document.getElementById('saveAndContinue');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');

    try {
        // UI עדכון
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        const form = document.querySelector('form');
        if (!form) throw new Error('Form element not found');
        
        // יצירת PDF
        console.log('[DEBUG] Creating PDF for section 2');
        const formElement = document.querySelector('.form-content');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const pdfBlob = pdf.output('blob');
        
        console.log('[DEBUG] PDF created, size:', pdfBlob.size);

        // העלאה ל-Firebase
        const fileName = `forms/section2_${Date.now()}.pdf`;
        const storageRef = firebase.storage().ref().child(fileName);
        const uploadTask = await storageRef.put(pdfBlob, {
            contentType: 'application/pdf',
            customMetadata: {
                section: '2',
                timestamp: new Date().toISOString()
            }
        });

        const pdfUrl = await uploadTask.ref.getDownloadURL();
        console.log('[DEBUG] PDF uploaded to Firebase:', pdfUrl);

        // שמירת נתונים
        const formData = new FormData(form);
        const sectionData = {
            ...Object.fromEntries(formData.entries()),
            section: '2',
            pdfUrl,
            pdfSize: pdfBlob.size,
            timestamp: new Date().toISOString()
        };

        // שמירה ב-Firestore
        const docRef = await firebase.firestore().collection('forms').add(sectionData);
        console.log('[DEBUG] Data saved to Firestore:', docRef.id);

        // שמירה ב-localStorage
        localStorage.setItem('section2Data', JSON.stringify(sectionData));
        console.log('[DEBUG] Section 2 localStorage saved:', sectionData);

        showMessage('הנתונים נשמרו בהצלחה', 'success');
        
        setTimeout(() => {
            window.location.href = '/sections/section3.html';
        }, 1500);

    } catch (error) {
        console.error('[ERROR] Section 2 submission failed:', error);
        showMessage(error.message || 'אירעה שגיאה בשמירת הנתונים');
    } finally {
        submitButton.disabled = false;
        buttonText.style.opacity = '1';
        buttonLoader.style.display = 'none';
    }
}
