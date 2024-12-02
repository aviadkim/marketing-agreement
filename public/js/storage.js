// public/js/storage.js

class StorageHandler {
    constructor() {
        this.initialize();
    }

    initialize() {
        // מחיקת כל הנתונים אם נמצאים בסקשן 1
        if (window.location.pathname.includes('section1')) {
            this.clearAllData();
            return;
        }

        // טעינת נתונים שמורים אם קיימים
        this.loadSavedData();
        
        // הגדרת שמירה אוטומטית
        this.setupAutoSave();
    }

    clearAllData() {
        localStorage.clear();
    }

    loadSavedData() {
        const form = document.querySelector('form');
        if (!form) return;

        const savedData = localStorage.getItem('formData');
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

        const saveFormData = () => {
            const formData = {};
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    if (input.checked) {
                        formData[input.name] = input.checked;
                    }
                } else {
                    formData[input.name] = input.value;
                }
            });

            localStorage.setItem('formData', JSON.stringify(formData));
        };

        form.addEventListener('change', saveFormData);
        form.addEventListener('input', saveFormData);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.storageHandler = new StorageHandler();
});
