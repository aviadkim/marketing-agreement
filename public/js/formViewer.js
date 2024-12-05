async function loadFormData() {
    try {
        // Get ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const formId = urlParams.get('id');
        if (!formId) return null;

        // Get stored form data
        let formData = {};
        for (let i = 1; i <= 4; i++) {
            const sectionData = localStorage.getItem(`section${i}Data`);
            if (sectionData) {
                Object.assign(formData, JSON.parse(sectionData));
            }
        }

        // Display form data
        displayFormData(formData);
        
    } catch (error) {
        console.error('Error loading form:', error);
        showError('שגיאה בטעינת הטופס');
    }
}

function displayFormData(data) {
    // Fill in form fields
    Object.entries(data).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
            if (element.tagName === 'INPUT' && element.type === 'checkbox') {
                element.checked = value === true || value === 'on' || value === 'כן';
            } else {
                element.textContent = value;
            }
        }
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadFormData);
