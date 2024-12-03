// Get current section number from URL
let currentSection = parseInt(window.location.pathname.match(/section(\d+)/)?.[1] || 1);
let formData = {};

// Load saved data from localStorage
function loadSavedData() {
    const saved = localStorage.getItem('formData');
    if (saved) {
        try {
            formData = JSON.parse(saved);
            populateFormFields();
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Save form data to localStorage
function saveFormData(form) {
    const data = new FormData(form);
    const savedData = {};
    
    // Save all form fields
    data.forEach((value, key) => {
        savedData[key] = value;
    });
    
    // Save signature if exists
    if (document.getElementById('signatureData')) {
        savedData.signature = document.getElementById('signatureData').value;
        if (savedData.signature) {
            localStorage.setItem('lastSignature', savedData.signature);
        }
    }
    
    localStorage.setItem('formData', JSON.stringify(savedData));
    showSaveMessage();
}

// Populate form fields with saved data
function populateFormFields() {
    const form = document.querySelector('form');
    if (!form || !formData) return;

    // For each saved field
    Object.entries(formData).forEach(([key, value]) => {
        const field = form.elements[key];
        if (!field) return;

        if (field.type === 'checkbox') {
            field.checked = value === 'on';
        } else if (field.type === 'radio') {
            const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
            if (radio) radio.checked = true;
        } else if (field.type === 'select-one' || field.type === 'select-multiple') {
            if (value) field.value = value;
        } else {
            field.value = value;
        }
    });

    // Load signature if exists
    const signatureData = localStorage.getItem('lastSignature');
    if (signatureData && window.signatureHandler?.signaturePad) {
        window.signatureHandler.signaturePad.fromDataURL(signatureData);
        if (document.getElementById('signatureData')) {
            document.getElementById('signatureData').value = signatureData;
        }
    }
}

// Show save message
function showSaveMessage() {
    const message = document.createElement('div');
    message.className = 'save-message';
    message.textContent = 'נשמר בהצלחה';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
}

// Navigate to next section
function navigateNext() {
    const form = document.querySelector('form');
    if (!form) return;

    if (form.checkValidity()) {
        saveFormData(form);
        window.location.href = `/sections/section${currentSection + 1}.html`;
    } else {
        form.reportValidity();
    }
}

// Navigate to previous section
function navigateBack() {
    if (currentSection > 1) {
        saveFormData(document.querySelector('form'));
        window.location.href = `/sections/section${currentSection - 1}.html`;
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadSavedData();

    // Auto-save on form changes
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('change', function() {
            saveFormData(this);
        });
    }

    // Back button
    const backButton = document.getElementById('btnBack');
    if (backButton) {
        backButton.addEventListener('click', navigateBack);
    }

    // Next button (for sections 1-3)
    const nextButton = document.getElementById('saveAndContinue');
    if (nextButton) {
        nextButton.addEventListener('click', navigateNext);
    }

    // Submit button (for section 4)
    const submitButton = document.getElementById('finalSubmit');
    if (submitButton) {
        submitButton.addEventListener('click', submitFinalForm);
    }
});

// Submit final form
async function submitFinalForm(e) {
    e.preventDefault();
    const form = document.querySelector('form');

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Add signature
        if (document.getElementById('signatureData')) {
            data.signature = document.getElementById('signatureData').value;
        }

        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'שגיאה בשליחת הטופס');
        }

        // Clear stored data
        localStorage.removeItem('formData');
        localStorage.removeItem('lastSignature');

        // Redirect to preview
        window.location.href = '/sections/preview.html';

    } catch (error) {
        console.error('Form submission error:', error);
        alert('אירעה שגיאה בשליחת הטופס. נא לנסות שוב.');
    }
}
