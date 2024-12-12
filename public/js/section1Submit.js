const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz93-PXYufShXM0AazF3RWZL8mzo96aSFxbLMbjTCmW2Rw17tqPN6WnnTw66VJy3lVt/exec";

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Page loaded');
    
    const submitButton = document.getElementById('saveAndContinue');
    
    if (submitButton) {
        console.log('[DEBUG] Found submit button');
        
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('[DEBUG] Submit button clicked');
            
            const buttonText = submitButton.querySelector('.button-text');
            const buttonLoader = submitButton.querySelector('.button-loader');
            
            try {
                // UI updates
                submitButton.disabled = true;
                buttonText.style.opacity = '0';
                buttonLoader.style.display = 'block';
                console.log('[DEBUG] Starting PDF creation');

                // Get form content
                const formElement = document.querySelector('.form-content');
                if (!formElement) {
                    throw new Error('Form content not found');
                }

                // Create canvas
                console.log('[DEBUG] Creating canvas');
                const canvas = await html2canvas(formElement, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });
                console.log('[DEBUG] Canvas created');

                // Create PDF
                console.log('[DEBUG] Creating PDF');
                window.jsPDF = window.jspdf.jsPDF;
                const pdf = new jsPDF();
                const imgData = canvas.toDataURL('image/png', 1.0);
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                console.log('[DEBUG] PDF created');

                // Get form data
                const form = document.querySelector('form');
                const formData = new FormData(form);

                const data = {
                    section: "1",
                    formPdf: pdf.output('datauristring'),
                    idNumber: formData.get('idNumber') || 'unknown',
                    timestamp: new Date().toISOString()
                };

                console.log('[DEBUG] Sending to server');
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                console.log('[DEBUG] Server response received');

                // Save form data
                localStorage.setItem('formData', JSON.stringify({
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    idNumber: formData.get('idNumber'),
                    email: formData.get('email'),
                    phone: formData.get('phone')
                }));

                showMessage("הטופס נשלח בהצלחה", "success");
                
                setTimeout(() => {
                    window.location.href = '/sections/section2.html';
                }, 1000);

            } catch (error) {
                console.error('[ERROR]', error);
                showMessage("שגיאה בשליחת הטופס: " + error.message);
            } finally {
                submitButton.disabled = false;
                buttonText.style.opacity = '1';
                buttonLoader.style.display = 'none';
            }
        });
    } else {
        console.error('[ERROR] Submit button not found');
    }
});

function showMessage(message, type = "error") {
    const div = document.createElement("div");
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
        background: ${type === "success" ? "#4CAF50" : "#dc3545"};
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}
