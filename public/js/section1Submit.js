const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz93-PXYufShXM0AazF3RWZL8mzo96aSFxbLMbjTCmW2Rw17tqPN6WnnTw66VJy3lVt/exec";

document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG] Script loaded, URL:', GOOGLE_SCRIPT_URL);
    
    const submitButton = document.getElementById('saveAndContinue');
    if (!submitButton) {
        console.error('[ERROR] Submit button not found');
        return;
    }
    
    submitButton.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('[DEBUG] Form submission started');
        
        const buttonText = submitButton.querySelector('.button-text');
        const buttonLoader = submitButton.querySelector('.button-loader');
        
        try {
            submitButton.disabled = true;
            buttonText.style.opacity = '0';
            buttonLoader.style.display = 'block';

            // Capture form content
            console.log('[DEBUG] Capturing form content');
            const formElement = document.querySelector('.form-content');
            const canvas = await html2canvas(formElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff"
            });
            console.log('[DEBUG] Canvas created successfully');

            // Create PDF
            console.log('[DEBUG] Creating PDF');
            window.jsPDF = window.jspdf.jsPDF;
            const pdf = new jsPDF();
            const imgData = canvas.toDataURL("image/png", 1.0);
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            console.log('[DEBUG] PDF created successfully');

            // Get form data
            const form = document.querySelector('form');
            const formData = new FormData(form);
            
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                idNumber: formData.get('idNumber'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                section: "1",
                formPdf: pdf.output("datauristring"),
                timestamp: new Date().toISOString()
            };

            console.log('[DEBUG] Sending data to server...');
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            console.log('[DEBUG] Server response received:', response.status);

            localStorage.setItem('formData', JSON.stringify({
                firstName: data.firstName,
                lastName: data.lastName,
                idNumber: data.idNumber,
                email: data.email,
                phone: data.phone
            }));

            showMessage("הטופס נשלח בהצלחה", "success");
            console.log('[DEBUG] Form submitted successfully');
            
            setTimeout(() => {
                window.location.href = '/sections/section2.html';
            }, 1000);

        } catch (error) {
            console.error('[ERROR] Submission failed:', error);
            showMessage("שגיאה בשליחת הטופס");
        } finally {
            submitButton.disabled = false;
            buttonText.style.opacity = '1';
            buttonLoader.style.display = 'none';
        }
    });
});
