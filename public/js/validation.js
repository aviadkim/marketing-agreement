// Form Validation Helper
class FormValidator {
    constructor() {
        if (window.formValidator) {
            return window.formValidator;
        }
        window.formValidator = this;
        this.initializeValidation();
        console.log('[DEBUG] FormValidator initialized');
    }

    initializeValidation() {
        // Add validation for each field type
        this.addIdNumberValidation();
        this.addPhoneValidation();
        this.addEmailValidation();
        this.addInvestmentAmountValidation();
        
        // Log all validated fields
        const fields = document.querySelectorAll('input[required]');
        console.log(`[DEBUG] Found ${fields.length} fields to validate`);
    }

    addIdNumberValidation() {
        const idInput = document.querySelector('input[name="idNumber"]');
        if (!idInput) {
            console.warn('[WARN] ID number input not found');
            return;
        }

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
        if (!phoneInput) {
            console.warn('[WARN] Phone input not found');
            return;
        }

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
        if (!emailInput) {
            console.warn('[WARN] Email input not found');
            return;
        }

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
        if (!amountInput) {
            console.warn('[WARN] Investment amount input not found');
            return;
        }

        amountInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (isNaN(value) || value < 0) {
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
        if (!/^\d{9}$/.test(id)) return false;
        
        const digits = id.split('').map(Number);
        let sum = 0;
        
        for (let i = 0; i < 9; i++) {
            let digit = digits[i];
            if (i % 2 === 0) {
                digit *= 1;
            } else {
                digit *= 2;
                if (digit > 9) {
                    digit = (digit % 10) + Math.floor(digit / 10);
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateSection(sectionElement) {
        if (!sectionElement) {
            console.error('[ERROR] Section element not provided for validation');
            return false;
        }

        const inputs = sectionElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        let firstInvalid = null;

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                isValid = false;
                if (!firstInvalid) {
                    firstInvalid = input;
                }
                console.log(`[DEBUG] Invalid field:`, {
                    name: input.name,
                    type: input.type,
                    value: input.value,
                    validationMessage: input.validationMessage
                });
            }
        });

        if (!isValid && firstInvalid) {
            firstInvalid.reportValidity();
            firstInvalid.focus();
            console.log(`[DEBUG] First invalid field: ${firstInvalid.name}`);
        }

        return isValid;
    }

    validateForm() {
        const form = document.getElementById('mainForm');
        if (!form) {
            console.error('[ERROR] Form not found');
            return false;
        }

        const isValid = form.checkValidity();
        if (!isValid) {
            console.log('[DEBUG] Form validation failed');
            const invalidInputs = form.querySelectorAll(':invalid');
            invalidInputs.forEach(input => {
                console.log(`[DEBUG] Invalid field: ${input.name} - ${input.validationMessage}`);
            });
        }

        return isValid;
    }
}

// Initialize validation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Initializing form validation');
    window.formValidator = new FormValidator();
});
