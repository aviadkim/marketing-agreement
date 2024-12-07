// section1Submit.js

console.log('section1Submit.js loaded');

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwf-7F8NIXbcDGTCKsx_5eCfxv9BTgGkSTYKMfWbCQNm37Rab2HA70gt8MkiXZWd6Ps/exec';

async function submitToGoogleSheets(formData) {
    console.log('Attempting to submit to Google Sheets');
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Google Sheets response:', response);
        return true;
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        return false;
    }
}

// Hook into navigation.js's form submission
const originalSaveFormData = window.saveFormData;
window.saveFormData = async function() {
    // First, let navigation.js do its thing
    if (originalSaveFormData) {
        originalSaveFormData();
    }
    
    // Then submit to Google Sheets
    const form = document.querySelector('form');
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        section: '1',
        timestamp: new Date().toISOString(),
        data: Object.fromEntries(formData)
    };
    
    console.log('Sending data to Google Sheets:', data);
    await submitToGoogleSheets(data);
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Section 1 submission handler initialized');
});
