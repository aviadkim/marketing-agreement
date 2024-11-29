document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;

    // הגדרות ראשוניות לחתימה
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'white',
        penColor: 'black',
        minWidth: 1,
        maxWidth: 2.5
    });

    // פונקציה להתאמת גודל הקנבס
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }

    // קריאה ראשונית להתאמת גודל
    resizeCanvas();

    // התאמת גודל בעת שינוי גודל החלון
    window.addEventListener("resize", resizeCanvas);

    // ניקוי החתימה
    document.getElementById('clearSignature').addEventListener('click', function() {
        signaturePad.clear();
        validateForm();
    });

    // העתקת חתימה קודמת
    document.getElementById('copySignature').addEventListener('click', function() {
        const previousSignature = localStorage.getItem('signature');
        if (previousSignature) {
            signaturePad.fromDataURL(previousSignature);
            validateForm();
        } else {
            alert('לא נמצאה חתימה קודמת');
        }
    });

    // וולידציה של הטופס
    function validateForm() {
        const submitButton = document.getElementById('finalSubmit');
        const finalConfirmation = document.querySelector('input[name="finalConfirmation"]');
        
        // בדיקה האם יש חתימה והאישור הסופי מסומן
        const isValid = !signaturePad.isEmpty() && finalConfirmation.checked;
        
        if (submitButton) {
            submitButton.disabled = !isValid;
        }
    }

    // הוספת מאזין לשינויים בחתימה
    signaturePad.addEventListener("endStroke", validateForm);

    // הוספת מאזין לשינויים באישור הסופי
    document.querySelector('input[name="finalConfirmation"]').addEventListener('change', validateForm);

    // שמירת החתימה בעת שליחת הטופס
    document.getElementById('finalSubmit').addEventListener('click', function() {
        if (!signaturePad.isEmpty()) {
            const signatureData = signaturePad.toDataURL();
            localStorage.setItem('signature', signatureData);
            document.getElementById('signatureData').value = signatureData;
        }
    });
});
