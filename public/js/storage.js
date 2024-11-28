// storage.js
document.addEventListener('DOMContentLoaded', function() {
    const formData = {};

    // שמירת נתונים בכל שינוי בטופס
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('change', function(e) {
            const formSection = this.id; // section1-form, section2-form, etc.
            
            // שומר את כל הנתונים מהטופס הנוכחי
            const formElements = new FormData(this);
            formData[formSection] = {};
            
            formElements.forEach((value, key) => {
                formData[formSection][key] = value;
            });

            // שמירה ב-localStorage
            localStorage.setItem('formData', JSON.stringify(formData));

            // הצגת הודעת שמירה
            showSaveMessage();
        });
    });

    // טעינת נתונים שמורים בטעינת הדף
    function loadSavedData() {
        const savedData = localStorage.getItem('formData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            const currentForm = document.querySelector('form');
            if (currentForm && parsedData[currentForm.id]) {
                Object.entries(parsedData[currentForm.id]).forEach(([key, value]) => {
                    const input = currentForm.querySelector(`[name="${key}"]`);
                    if (input) {
                        if (input.type === 'checkbox' || input.type === 'radio') {
                            input.checked = value === 'true' || value === true;
                        } else {
                            input.value = value;
                        }
                    }
                });
            }
        }
    }

    // הצגת הודעת שמירה
    function showSaveMessage() {
        const message = document.createElement('div');
        message.className = 'save-message';
        message.textContent = 'הנתונים נשמרו באופן אוטומטי';
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    loadSavedData();
});