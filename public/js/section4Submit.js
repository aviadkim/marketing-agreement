const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

function validateForm(form) {
    console.log('[DEBUG] Starting form validation');
    
    // Check required checkboxes
    const requiredCheckboxes = ['riskAcknowledgement', 'independentDecision', 'updateCommitment'];
    const missingCheckboxes = requiredCheckboxes.filter(id => !form.querySelector(`input[name="${id}"]`).checked);
    
    if (missingCheckboxes.length > 0) {
        console.log('[DEBUG] Missing checkboxes:', missingCheckboxes);
        showMessage('?? ???? ?? ?? ???????', 'error');
        return false;
    }

    // Check signature
    const signatureData = document.getElementById('signatureData')?.value;
    if (!signatureData) {
        console.log('[DEBUG] Signature missing');
        showMessage('????? ?????', 'error');
        return false;
    }

    console.log('[DEBUG] Form validation passed');
    return true;
}

async function submitForm() {
    console.log('[DEBUG] Starting form submission');
    const form = document.querySelector('form');
    if (!form) {
        console.error('[ERROR] Form not found');
        return;
    }

    if (!validateForm(form)) {
        return;
    }

    try {
        showMessage('???? ????...', 'info');
        
        // Get signature data
        const signatureData = document.getElementById('signatureData').value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.signature = signatureData;
        
        console.log('[DEBUG] Preparing submission data:', data);

        // Submit to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('[DEBUG] Submission response:', response);
        showMessage('????? ???? ??????', 'success');
        
        setTimeout(() => {
            window.location.href = '/sections/thank-you.html';
        }, 1000);
    } catch (error) {
        console.error('[ERROR] Submission failed:', error);
        showMessage('????? ?????? ?????', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Section 4 initialized');
    
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[DEBUG] Submit button clicked');
            submitForm();
        });
    }
});
