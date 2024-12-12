async function submitForm(e) {
    e.preventDefault();
    
    // Create debug div
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = `
        position: fixed;
        left: 20px;
        top: 20px;
        background: white;
        padding: 10px;
        border: 1px solid black;
        z-index: 9999;
    `;
    document.body.appendChild(debugDiv);
    
    function updateDebug(message) {
        debugDiv.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
    }

    updateDebug('Starting submission...');

    const submitButton = document.getElementById("saveAndContinue");
    submitButton.disabled = true;
    submitButton.textContent = "שולח...";

    try {
        // Create canvas
        updateDebug('Creating canvas...');
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });
        updateDebug('Canvas created');

        // Create PDF
        updateDebug('Creating PDF...');
        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        updateDebug('PDF created');

        // Prepare data
        const formData = new FormData(document.querySelector("form"));
        const data = {
            section: "1",
            formPdf: pdf.output("datauristring"),
            idNumber: formData.get("idNumber") || "unknown",
            timestamp: new Date().toISOString()
        };
        updateDebug('Data prepared');

        // Send to server
        updateDebug('Sending to server...');
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        updateDebug('Server response received');

        // Handle response
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        updateDebug('Success! Moving to next section...');
        showMessage("הטופס נשלח בהצלחה", "success");
        
        // Save form data
        localStorage.setItem('formData', JSON.stringify({
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            idNumber: formData.get("idNumber"),
            email: formData.get("email"),
            phone: formData.get("phone")
        }));

        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 3000); // Increased to 3 seconds to see the debug info

    } catch (error) {
        updateDebug(`Error: ${error.message}`);
        showMessage("שגיאה בשליחת הטופס");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "המשך לשלב הבא";
    }
}
