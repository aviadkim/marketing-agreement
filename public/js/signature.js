class SignaturePadManager {
    constructor() {
        this.canvas = document.getElementById('signatureCanvas');
        this.signaturePad = null;
        this.initSignaturePad();
        this.bindEvents();
    }

    initSignaturePad() {
        // ודא שה-canvas קיים בדף
        if (!this.canvas) return;

        // אתחול ה-SignaturePad
        this.signaturePad = new SignaturePad(this.canvas, {
            backgroundColor: 'white',
            penColor: 'black',
            minWidth: 1,
            maxWidth: 2.5,
            velocityFilterWeight: 0.7,
            throttle: 16, // קצב רענון מקסימלי של 60fps
        });

        // התאמת גודל ראשונית
        this.resizeCanvas();
    }

    resizeCanvas() {
        // קבל את הגודל הרצוי מהמיכל
        const container = this.canvas.parentElement;
        const containerStyle = getComputedStyle(container);
        const width = parseInt(containerStyle.width) - 2; // פחות 2 פיקסלים בגלל הגבול
        const height = 200; // גובה קבוע

        // התאמה לרזולוציית המסך
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        this.canvas.width = width * ratio;
        this.canvas.height = height * ratio;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        // התאמת הקונטקסט
        const context = this.canvas.getContext('2d');
        context.scale(ratio, ratio);

        // ניקוי החתימה הקיימת
        if (this.signaturePad) {
            this.signaturePad.clear();
        }
    }

    bindEvents() {
        // האזנה לשינוי גודל החלון
        window.addEventListener('resize', () => this.resizeCanvas());

        // כפתור ניקוי
        const clearButton = document.getElementById('clearSignature');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearSignature());
        }

        // כפתור העתקת חתימה קודמת
        const copyButton = document.getElementById('copySignature');
        if (copyButton) {
            copyButton.addEventListener('click', () => this.copyPreviousSignature());
        }

        // שמירת החתימה בעת שליחת הטופס
        const submitButton = document.getElementById('finalSubmit');
        if (submitButton) {
            submitButton.addEventListener('click', () => this.saveSignature());
        }

        // הוספת וולידציה לחתימה
        if (this.signaturePad) {
            this.signaturePad.addEventListener('endStroke', () => this.validateSignature());
        }
    }

    clearSignature() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            this.validateSignature();
        }
    }

    copyPreviousSignature() {
        const previousSignature = localStorage.getItem('signature');
        if (previousSignature && this.signaturePad) {
            const image = new Image();
            image.onload = () => {
                const context = this.canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                this.validateSignature();
            };
            image.src = previousSignature;
        } else {
            alert('לא נמצאה חתימה קודמת');
        }
    }

    saveSignature() {
        if (this.signaturePad && !this.signaturePad.isEmpty()) {
            const signatureData = this.signaturePad.toDataURL();
            localStorage.setItem('signature', signatureData);
            document.getElementById('signatureData').value = signatureData;
        }
    }

    validateSignature() {
        const submitButton = document.getElementById('finalSubmit');
        const isEmpty = this.signaturePad.isEmpty();
        
        // בדוק אם כל שאר התנאים מתקיימים
        const finalConfirmation = document.querySelector('input[name="finalConfirmation"]');
        const allChecked = finalConfirmation && finalConfirmation.checked;

        if (submitButton) {
            submitButton.disabled = isEmpty || !allChecked;
        }

        // הוספת או הסרת מחלקת שגיאה מה-canvas
        this.canvas.classList.toggle('error', isEmpty);
    }
}

// אתחול המנהל כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    new SignaturePadManager();
});
