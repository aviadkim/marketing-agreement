document.addEventListener('DOMContentLoaded', function() {
    // מעקב אחר סטטוס קריאה של כל הצהרה
    const declarations = {
        'declaration1': false,
        'declaration2': false,
        'declaration3': false
    };

    // יצירת סמני התקדמות בראש הטופס
    function createProgressMarkers() {
        const container = document.createElement('div');
        container.className = 'declarations-progress';
        container.innerHTML = `
            <div class="progress-marker" data-declaration="declaration1">
                <div class="marker-circle"></div>
                <div class="marker-label">הצהרת סיכונים</div>
            </div>
            <div class="progress-marker" data-declaration="declaration2">
                <div class="marker-circle"></div>
                <div class="marker-label">החלטה עצמאית</div>
            </div>
            <div class="progress-marker" data-declaration="declaration3">
                <div class="marker-circle"></div>
                <div class="marker-label">עדכון פרטים</div>
            </div>
        `;
        
        const form = document.getElementById('section4-form');
        form.insertBefore(container, form.firstChild);
    }

    // עדכון סטטוס קריאה
    function updateDeclarationStatus(declarationId, isRead) {
        declarations[declarationId] = isRead;
        updateProgressMarker(declarationId);
        updateFinalCheckbox();
    }

    // עדכון סמן ההתקדמות הויזואלי
    function updateProgressMarker(declarationId) {
        const marker = document.querySelector(`.progress-marker[data-declaration="${declarationId}"]`);
        if (declarations[declarationId]) {
            marker.classList.add('completed');
        } else {
            marker.classList.remove('completed');
        }
    }

    // בדיקה אם כל ההצהרות נקראו
    function updateFinalCheckbox() {
        const allRead = Object.values(declarations).every(status => status);
        const finalCheckbox = document.querySelector('input[name="finalConfirmation"]');
        finalCheckbox.disabled = !allRead;
        
        if (allRead) {
            finalCheckbox.closest('.final-confirmation').classList.add('enabled');
        } else {
            finalCheckbox.closest('.final-confirmation').classList.remove('enabled');
        }
    }

    // טיפול בפתיחה וסגירה של האקורדיון
    function handleAccordion(header) {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.accordion-icon');
        const isOpen = content.classList.contains('open');
        const declarationId = header.closest('.accordion-item').dataset.declaration;

        // סגירת כל החלקים האחרים
        document.querySelectorAll('.accordion-content').forEach(item => {
            item.classList.remove('open');
            item.style.maxHeight = null;
            item.previousElementSibling.querySelector('.accordion-icon').textContent = '▼';
        });

        // פתיחה/סגירה של החלק הנוכחי
        if (!isOpen) {
            content.classList.add('open');
            content.style.maxHeight = content.scrollHeight + 'px';
            icon.textContent = '▲';
            
            // סימון כנקרא אחרי שניה
            setTimeout(() => {
                updateDeclarationStatus(declarationId, true);
            }, 1000);
        }
    }

    // אתחול
    createProgressMarkers();

    // הוספת מאזינים
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => handleAccordion(header));
    });

    // טיפול בחתימה דיגיטלית
    const canvas = document.getElementById('signatureCanvas');
    if (canvas) {
        const signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'white',
            penColor: 'black'
        });

        document.getElementById('clearSignature').addEventListener('click', () => {
            signaturePad.clear();
        });

        document.getElementById('copySignature').addEventListener('click', () => {
            const previousSignature = localStorage.getItem('signature');
            if (previousSignature) {
                signaturePad.fromDataURL(previousSignature);
            }
        });

        // שמירת החתימה בעת שליחה
        document.getElementById('finalSubmit').addEventListener('click', () => {
            if (!signaturePad.isEmpty()) {
                const signatureData = signaturePad.toDataURL();
                document.getElementById('signatureData').value = signatureData;
                localStorage.setItem('signature', signatureData);
            }
        });
    }
});
