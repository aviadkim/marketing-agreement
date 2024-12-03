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
    let savedData = {};
    data.forEach((value, key) => {
        savedData[key] = value;
    });

    // Add signature if exists
    const signatureData = document.getElementById('signatureData')?.value;
    if (signatureData) {
        savedData.signature = signatureData;
        localStorage.setItem('lastSignature', signatureData);
    }

    localStorage.setItem('formData', JSON.stringify(savedData));
    showSaveMessage();
}

// Populate form fields with saved data
function populateFormFields() {
    const form = document.querySelector('form');
    if (!form || !formData) return;

    Object.entries(formData).forEach(([key, value]) => {
        const field = form.elements[key];
        if (!field) return;

        if (field.type === 'checkbox') {
            field.checked = value === 'on';
        } else if (field.type === 'radio') {
            const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
            if (radio) radio.checked = true;
        } else {
            field.value = value;
        }
    });

    // Load signature if exists
    const signatureData = localStorage.getItem('lastSignature');
    if (signatureData && window.signatureHandler) {
        window.signatureHandler.signaturePad?.fromDataURL(signatureData);
        document.getElementById('signatureData').value = signatureData;
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

// Validate and submit form
async function submitFinalForm(e) {
    e.preventDefault();
    const form = document.querySelector('form');

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Add signature
        data.signature = document.getElementById('signatureData')?.value;

        // Debug log
        console.log('Submitting data:', data);

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

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();

    // Auto-save on form changes
    document.querySelector('form')?.addEventListener('change', function() {
        saveFormData(this);
    });

    // Submit button
    document.getElementById('finalSubmit')?.addEventListener('click', submitFinalForm);

    // Back button
    document.getElementById('btnBack')?.addEventListener('click', function() {
        if (currentSection > 1) {
            window.location.href = `/sections/section${currentSection - 1}.html`;
        }
    });

    // Next button (non-final sections)
    document.getElementById('saveAndContinue')?.addEventListener('click', function() {
        const form = document.querySelector('form');
        if (form.checkValidity()) {
            saveFormData(form);
            window.location.href = `/sections/section${currentSection + 1}.html`;
        } else {
            form.reportValidity();
        }
    });
});
