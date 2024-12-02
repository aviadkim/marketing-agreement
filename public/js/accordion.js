// public/js/accordion.js

class AccordionHandler {
    constructor() {
        this.declarations = {
            'declaration1': false,
            'declaration2': false,
            'declaration3': false
        };
        this.initialize();
    }

    initialize() {
        // הוספת מאזינים לאקורדיון
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => this.handleAccordion(header));
        });

        // הוספת מאזינים לצ'קבוקסים
        document.querySelectorAll('input[type="checkbox"][required]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const declarationId = e.target.closest('.accordion-item').dataset.declaration;
                this.updateDeclarationStatus(declarationId, e.target.checked);
            });
        });

        this.updateAllMarkers();
    }

    handleAccordion(header) {
        const content = header.nextElementSibling;
        const parent = header.parentElement;
        const isOpen = content.style.maxHeight;

        // סגירת כל שאר האקורדיונים
        document.querySelectorAll('.accordion-content').forEach(item => {
            item.style.maxHeight = null;
            item.parentElement.classList.remove('active');
        });

        document.querySelectorAll('.accordion-icon').forEach(icon => {
            icon.textContent = '▼';
        });

        // פתיחה/סגירה של האקורדיון הנוכחי
        if (!isOpen) {
            content.style.maxHeight = content.scrollHeight + "px";
            parent.classList.add('active');
            header.querySelector('.accordion-icon').textContent = '▲';
        } else {
            content.style.maxHeight = null;
            parent.classList.remove('active');
            header.querySelector('.accordion-icon').textContent = '▼';
        }
    }

    updateDeclarationStatus(declarationId, isChecked) {
        this.declarations[declarationId] = isChecked;
        this.updateMarker(declarationId);
        this.updateFinalConfirmation();
    }

    updateMarker(declarationId) {
        const marker = document.querySelector(`.progress-marker[data-declaration="${declarationId}"]`);
        if (marker) {
            if (this.declarations[declarationId]) {
                marker.classList.add('completed');
            } else {
                marker.classList.remove('completed');
            }
        }
    }

    updateAllMarkers() {
        Object.keys(this.declarations).forEach(declarationId => {
            const checkbox = document.querySelector(`[data-declaration="${declarationId}"] input[type="checkbox"]`);
            if (checkbox) {
                this.declarations[declarationId] = checkbox.checked;
                this.updateMarker(declarationId);
            }
        });
    }

    updateFinalConfirmation() {
        const finalCheckbox = document.querySelector('input[name="finalConfirmation"]');
        const submitButton = document.getElementById('finalSubmit');
        
        const allChecked = Object.values(this.declarations).every(status => status);
        
        if (finalCheckbox) {
            finalCheckbox.disabled = !allChecked;
        }

        if (submitButton) {
            const signatureInput = document.getElementById('signatureData');
            const hasSignature = signatureInput && signatureInput.value;
            const finalConfirmationChecked = finalCheckbox && finalCheckbox.checked;
            
            submitButton.disabled = !(allChecked && hasSignature && finalConfirmationChecked);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accordionHandler = new AccordionHandler();
});
