console.log('[DEBUG] Script loading started');

async function submitForm(e) {
    e?.preventDefault();
    console.log('[DEBUG] Form submission started');

    const submitButton = document.getElementById('saveAndContinue');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');

    try {
        // Disable button
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';
        console.log('[DEBUG] Button disabled');

        // Get form data
        const form = document.querySelector('form');
        const formData = new FormData(form);
        console.log('[DEBUG] Form data collected');

        // Create screenshot
        console.log('[DEBUG] Creating screenshot');
        const formElement = document.querySelector('.form-card');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        // Convert to PDF
        console.log('[DEBUG] Creating PDF');
        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const pdfContent = pdf.output('datauristring');
        console.log('[DEBUG] PDF created');

        // Prepare data for server
        const data = {
            pdfContent: pdfContent,
            formData: {
                section: "1",
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                idNumber: formData.get('idNumber'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                timestamp: new Date().toISOString()
            }
        };

        // Send to server
        console.log('[DEBUG] Sending to server');
        const response = await fetch('/api/save-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to save PDF');
        }

        console.log('[DEBUG] Server response:', result);

        // Save to localStorage
        localStorage.setItem('formData', JSON.stringify(data.formData));
        console.log('[DEBUG] Saved to localStorage');

        showMessage('הטופס נשלח בהצלחה', 'success');

        // Navigate to next section
        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 1000);

    } catch (error) {
        console.error('[ERROR] Submit failed:', error);
        showMessage("שגיאה בשליחת הטופס: " + error.message);
    } finally {
        submitButton.disabled = false;
        buttonText.style.opacity = '1';
        buttonLoader.style.display = 'none';
    }
}

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
        background: ${type === 'success' ? '#4CAF50' : '#dc3545'};
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Page loaded');
    
    const submitButton = document.getElementById('saveAndContinue');
    if (submitButton) {
        submitButton.addEventListener('click', submitForm);
        console.log('[DEBUG] Submit button handler attached');
    } else {
        console.error('[ERROR] Submit button not found');
    }
});
