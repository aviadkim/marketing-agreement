// public/js/accordion.js

class AccordionHandler {
    constructor() {
        this.declarations = {
            'declaration1': false,
            'declaration2': false,
            'declaration3': false
        };
        this.initialize();
        this.setupCheckboxListeners();
    }

    initialize() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => this.handleAccordion(header));
        });
        this.updateAllMarkers();
    }

    handleAccordion(header) {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.accordion-icon');
        const parent = header.parentElement;
        const isOpen = content.style.maxHeight;

        // סגירת כל האקורדיונים האחרים
        document.querySelectorAll('.accordion-content').forEach(item => {
            item.style.maxHeight = null;
        });
        document.querySelectorAll('.accordion-icon').forEach(icon => {
            icon.textContent = '▼';
        });
        document.querySelectorAll('.accordion-item').forEach(item => {
            item.classList.remove('active');
        });

        // פתיחה/סגירה של האקורדיון הנוכחי
        if (!isOpen) {
            const height = content.scrollHeight;
            content.style.maxHeight = height + "px";
            icon.textContent = '▲';
            parent.classList.add('active');
        }
    }

    setupCheckboxListeners() {
        document.querySelectorAll('.accordion-content input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const declarationId = e.target.closest('.accordion-item').dataset.declaration;
                this.updateDeclarationStatus(declarationId, e.target.checked);
            });
        });
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

    isAllDeclartionsChecked() {
        return Object.values(this.declarations).every(status => status);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.accordionHandler = new AccordionHandler();
});
