// validation.js
document.addEventListener('DOMContentLoaded', function() {
    // בדיקות תקינות מותאמות אישית
    const validators = {
        // בדיקת תעודת זהות ישראלית
        idNumber: function(value) {
            // אלגוריתם בדיקת ת.ז.
            if (value.length !== 9) return false;
            return Array.from(value, Number)
                .reduce((sum, digit, i) => {
                    const step = digit * ((i % 2) + 1);
                    return sum + (step > 9 ? step - 9 : step);
                }, 0) % 10 === 0;
        },

        // בדיקת סכום השקעה מינימלי
        investmentAmount: function(value) {
            return value >= 50000; // לדוגמה: מינימום 50,000 ש"ח
        },

        // בדיקת תיבת דואר אלקטרוני
        email: function(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
    };

    // הוספת בדיקות תקינות לשדות
    function addValidation() {
        document.querySelectorAll('input').forEach(input => {
            const validatorType = input.dataset.validate;
            if (validatorType && validators[validatorType]) {
                input.addEventListener('input', function() {
                    const isValid = validators[validatorType](this.value);
                    this.classList.toggle('invalid', !isValid);
                    showValidationMessage(this, isValid);
                });
            }
        });
    }

    // הצגת הודעות תקינות
    function showValidationMessage(input, isValid) {
        let messageElement = input.nextElementSibling;
        if (!messageElement || !messageElement.classList.contains('validation-message')) {
            messageElement = document.createElement('div');
            messageElement.className = 'validation-message';
            input.parentNode.insertBefore(messageElement, input.nextSibling);
        }

        const messages = {
            idNumber: 'מספר תעודת זהות לא תקין',
            investmentAmount: 'סכום ההשקעה המינימלי הוא 50,000 ש"ח',
            email: 'כתובת דואר אלקטרוני לא תקינה'
        };

        messageElement.textContent = isValid ? '' : messages[input.dataset.validate];
        messageElement.style.display = isValid ? 'none' : 'block';
    }

    addValidation();
});