const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz93-PXYufShXM0AazF3RWZL8mzo96aSFxbLMbjTCmW2Rw17tqPN6WnnTw66VJy3lVt/exec";

async function captureFormToPDF(formElement) {
    const canvas = await html2canvas(formElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
    });

    window.jsPDF = window.jspdf.jsPDF;
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL("image/png", 1.0);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    
    return pdf.output("datauristring");
}

document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('saveAndContinue');
    
    submitButton.addEventListener('click', async function(e) {
        e.preventDefault();
        const buttonText = submitButton.querySelector('.button-text');
        const buttonLoader = submitButton.querySelector('.button-loader');
        
        try {
            // UI updates
            submitButton.disabled = true;
            buttonText.style.opacity = '0';
            buttonLoader.style.display = 'block';

            // Get form data
            const form = document.querySelector('form');
            const formData = new FormData(form);
            const formElement = document.querySelector('.form-content');
            
            // Create PDF
            const pdfData = await captureFormToPDF(formElement);
            
            // Prepare submission data
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                idNumber: formData.get('idNumber'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                section: "1",
                formPdf: pdfData,
                timestamp: new Date().toISOString()
            };

            // Send to server
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // Save data locally
            localStorage.setItem('formData', JSON.stringify({
                firstName: data.firstName,
                lastName: data.lastName,
                idNumber: data.idNumber,
                email: data.email,
                phone: data.phone
            }));

            // Success handling
            showMessage("הטופס נשלח בהצלחה", "success");
            
            // Navigate to next section
            setTimeout(() => {
                window.location.href = '/sections/section2.html';
            }, 1000);

        } catch (error) {
            console.error('Error:', error);
            showMessage("שגיאה בשליחת הטופס");
        } finally {
            submitButton.disabled = false;
            buttonText.style.opacity = '1';
            buttonLoader.style.display = 'none';
        }
    });
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
