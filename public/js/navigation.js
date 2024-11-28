// navigation.js
document.addEventListener('DOMContentLoaded', function() {
    const saveAndContinue = document.getElementById('saveAndContinue');
    const finalSubmit = document.getElementById('finalSubmit');

    // בדיקת תקינות לפני מעבר לדף הבא
    function validateCurrentSection() {
        const currentForm = document.querySelector('form');
        if (!currentForm.checkValidity()) {
            // הצגת הודעות שגיאה מובנות של הדפדפן
            currentForm.reportValidity();
            return false;
        }
        return true;
    }

    // המשך לדף הבא
    function navigateToNext() {
        const currentSection = window.location.pathname.split('/').pop();
        const nextSection = getNextSection(currentSection);
        
        if (validateCurrentSection()) {
            window.location.href = nextSection;
        }
    }

    // קבלת הדף הבא לפי הדף הנוכחי
    function getNextSection(currentSection) {
        const sections = {
            'section1.html': 'section2.html',
            'section2.html': 'section3.html',
            'section3.html': 'section4.html',
            'section4.html': 'preview.html'
        };
        return sections[currentSection] || 'section1.html';
    }

    // הגשה סופית של הטופס
    async function submitForm() {
        if (!validateCurrentSection()) return;

        try {
            const allData = JSON.parse(localStorage.getItem('formData'));
            
            // איסוף כל הנתונים מכל החלקים
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(allData)
            });

            if (response.ok) {
                // מעבר לדף תודה
                window.location.href = '/thank-you.html';
                // ניקוי הנתונים השמורים
                localStorage.clear();
            } else {
                throw new Error('שגיאה בשליחת הטופס');
            }
        } catch (error) {
            alert('אירעה שגיאה בשליחת הטופס: ' + error.message);
        }
    }

    // הוספת מאזינים לכפתורים
    if (saveAndContinue) {
        saveAndContinue.addEventListener('click', navigateToNext);
    }

    if (finalSubmit) {
        finalSubmit.addEventListener('click', submitForm);
    }
});