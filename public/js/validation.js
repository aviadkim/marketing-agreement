// Form Validation Helper
class FormValidator {
    constructor() {
        if (window.formValidator) {
            return window.formValidator;
        }
        window.formValidator = this;
        this.initializeValidation();
    }

    initializeValidation() {
        // ID number validation
        this.addIdNumberValidation();
        
        // Phone number validation
        this.addPhoneValidation();
        
        // Email validation
        this.addEmailValidation();

        // Investment amount validation
        this.addInvestmentAmountValidation();

        console.log('[DEBUG] Form validation initialized');
    }

    addIdNumberValidation() {
        const idInput = document.querySelector('input[name="idNumber"]');
        if (!idInput) return;

        idInput.addEventListener('input', (e) => {
            const value = e.target.value;
            // Allow only numbers
            e.target.value = value.replace(/[^\d]/g, '');
            
            // Israeli ID validation
            if (value.length === 9) {
                if (!this.validateIsraeliID(value)) {
                    idInput.setCustomValidity('מספר תעודת זהות לא תקין');
                } else {
                    idInput.setCustomValidity('');
                }
            }
        });
    }

    addPhoneValidation() {
        const phoneInput = document.querySelector('input[name="phone"]');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            const value = e.target.value;
            // Allow only numbers
            e.target.value = value.replace(/[^\d]/g, '');
            
            // Israeli phone validation
            if (value.length === 10) {
                if (!this.validateIsraeliPhone(value)) {
                    phoneInput.setCustomValidity('מספר טלפון לא תקין');
                } else {
                    phoneInput.setCustomValidity('');
                }
            }
        });
    }

    addEmailValidation() {
        const emailInput = document.querySelector('input[name="email"]');
        if (!emailInput) return;

        emailInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && !this.validateEmail(value)) {
                emailInput.setCustomValidity('כתובת אימייל לא תקינה');
            } else {
                emailInput.setCustomValidity('');
            }
        });
    }

    addInvestmentAmountValidation() {
        const amountInput = document.querySelector('input[name="investmentAmount"]');
        if (!amountInput) return;

        amountInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 0) {
                amountInput.setCustomValidity('סכום ההשקעה חייב להיות חיובי');
            } else if (value > 10000000) {
                amountInput.setCustomValidity('סכום ההשקעה גדול מדי');
            } else {
                amountInput.setCustomValidity('');
            }
        });
    }

    validateIsraeliID(id) {
        // Israeli ID validation algorithm
        if (id.length !== 9) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            let digit = parseInt(id.charAt(i));
            if (i % 2 === 0) {
                digit *= 1;
            } else {
                digit *= 2;
                if (digit > 9) {
                    digit = digit % 10 + Math.floor(digit / 10);
                }
            }
            sum += digit;
        }
        return sum % 10 === 0;
    }

    validateIsraeliPhone(phone) {
        // Must start with 05 and be 10 digits
        return /^05\d{8}$/.test(phone);
    }

    validateEmail(email) {
        // Basic email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validateSection(sectionElement) {
        const inputs = sectionElement.querySelectorAll('input, select, textarea');
        let isValid = true;
        let firstInvalid = null;

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                isValid = false;
                if (!firstInvalid) {
                    firstInvalid = input;
                }
            }
        });

        if (firstInvalid) {
            firstInvalid.reportValidity();
            firstInvalid.focus();
        }

        return isValid;
    }
}

// Initialize validation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Initializing form validation');
    new FormValidator();
});
