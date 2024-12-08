const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec';

function showMessage(message, type = 'error') {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = message;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        color: white;
        background: ${type === 'success' ? '#4CAF50' : type === 'info' ? '#2196F3' : '#dc3545'};
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

async function submitForm(e) {
    e.preventDefault();
    console.log('[DEBUG] Submit button clicked');

    const form = document.querySelector('form');
    if (!form) {
        console.error('[ERROR] Form not found');
        return;
    }

    // Check required checkboxes
    const requiredCheckboxes = ['riskAcknowledgement', 'independentDecision', 'updateCommitment'];
    const missingCheckboxes = requiredCheckboxes.filter(id => !document.querySelector(`input[name="${id}"]:checked`));
    
    if (missingCheckboxes.length > 0) {
        console.log('[DEBUG] Missing checkboxes:', missingCheckboxes);
        showMessage('?? ???? ?? ?? ???????');
        return;
    }

    // Get signature
    const canvas = document.querySelector('#signatureCanvas');
    if (!canvas || !window.signatureHandler || window.signatureHandler.isEmpty()) {
        console.log('[DEBUG] Signature missing');
        showMessage('????? ?????');
        return;
    }

    try {
        showMessage('???? ????...', 'info');
        
        // Prepare form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Add signature
        data.signature = canvas.toDataURL();
        data.timestamp = new Date().toISOString();

        console.log('[DEBUG] Sending data to server');

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('[DEBUG] Server response:', response);
        showMessage('????? ???? ??????', 'success');

        // Navigate after short delay
        setTimeout(() => {
            window.location.href = '/sections/thank-you.html';
        }, 1000);

    } catch (error) {
        console.error('[ERROR] Submit failed:', error);
        showMessage('????? ?????? ?????');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Initializing section 4');
    
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', submitForm);
    } else {
        console.error('[ERROR] Submit button not found');
    }
});
