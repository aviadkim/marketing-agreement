// storage.js
class StorageHandler {
    constructor() {
        this.currentSection = this.getCurrentSection();
        this.initialize();
    }

    getCurrentSection() {
        const path = window.location.pathname;
        const match = path.match(/section(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }

    initialize() {
        const formId = `section${this.currentSection}-form`;
        this.loadSavedData(formId);
        this.setupAutoSave();
        this.handleSignatureVisibility();
        this.setupNavigationStorage();
    }

    handleSignatureVisibility() {
        if (this.currentSection === 1) {
            const signatureSection = document.querySelector('.signature-section');
            const hasVisitedNext = localStorage.getItem('visitedSection1');
            
            if (signatureSection) {
                if (hasVisitedNext === 'true') {
                    signatureSection.style.display = 'block';
                    this.restoreSignature();
                } else {
                    signatureSection.style.display = 'none';
                }
            }
        }
    }

    restoreSignature() {
        const signatureData = localStorage.getItem('signature');
        if (signatureData && window.SignaturePad) {
            const canvas = document.getElementById('signatureCanvas1');
            const hiddenInput = document.getElementById('signatureCanvas1-data');
            
            if (canvas && hiddenInput) {
                const signaturePad = new SignaturePad(canvas);
                signaturePad.fromDataURL(signatureData);
                hiddenInput.value = signatureData;
            }
        }
    }

    setupNavigationStorage() {
        // שמירת מידע על ניווט בין דפים
        if (this.currentSection === 2) {
            localStorage.setItem('visitedSection2', 'true');
        }
    }

    loadSavedData(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const savedData = localStorage.getItem(formId);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.entries(data).forEach(([name, value]) => {
                    const input = form.querySelector(`[name="${name}"]`);
                    if (input) {
                        if (input.type === 'checkbox' || input.type === 'radio') {
                            input.checked = value === true || value === 'true';
                        } else {
                            input.value = value;
                        }
                    }
                });
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    setupAutoSave() {
        const form = document.querySelector('form');
        if (!form) return;

        const saveData = () => {
            const formData = {};
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                if (input.name) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        if (input.checked) {
                            formData[input.name] = input.checked;
                        }
                    } else {
                        formData[input.name] = input.value;
                    }
                }
            });

            localStorage.setItem(form.id, JSON.stringify(formData));
        };

        // שמירה בכל שינוי בטופס
        form.addEventListener('change', saveData);
        form.addEventListener('input', saveData);

        // שמירת חתימה
        const signatureInput = document.getElementById(`signatureCanvas${this.currentSection}-data`);
        if (signatureInput) {
            signatureInput.addEventListener('change', () => {
                localStorage.setItem('signature', signatureInput.value);
            });
        }
    }

    saveBeforeNavigation() {
        const form = document.querySelector('form');
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        localStorage.setItem(form.id, JSON.stringify(data));

        // שמירת חתימה אם קיימת
        const signatureInput = document.getElementById(`signatureCanvas${this.currentSection}-data`);
        if (signatureInput && signatureInput.value) {
            localStorage.setItem('signature', signatureInput.value);
        }
    }

    getAllFormData() {
        const allData = {};
        for (let i = 1; i <= 4; i++) {
            const sectionData = localStorage.getItem(`section${i}-form`);
            if (sectionData) {
                Object.assign(allData, JSON.parse(sectionData));
            }
        }
        return allData;
    }

    clearAllData() {
        localStorage.clear();
    }

    clearCurrentSection() {
        localStorage.removeItem(`section${this.currentSection}-form`);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.storageHandler = new StorageHandler();
});
