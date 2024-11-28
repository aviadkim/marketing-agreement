// signature.js
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('signatureCanvas');
    const clearButton = document.getElementById('clearSignature');
    const copyButton = document.getElementById('copySignature');
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)'
    });

    // התאמת גודל הקנבס
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // ניקוי החתימה
    clearButton.addEventListener('click', function() {
        signaturePad.clear();
    });

    // העתקת חתימה קודמת
    copyButton?.addEventListener('click', function() {
        const previousSignature = localStorage.getItem('previousSignature');
        if (previousSignature) {
            signaturePad.fromDataURL(previousSignature);
        } else {
            alert('לא נמצאה חתימה קודמת');
        }
    });

    // שמירת החתימה בזיכרון
    signaturePad.addEventListener("endStroke", () => {
        document.getElementById('signatureData').value = signaturePad.toDataURL();
        localStorage.setItem('previousSignature', signaturePad.toDataURL());
    });
});