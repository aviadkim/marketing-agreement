const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzHJTWLcu65gC9uXi5t8rzVaVIP5D3rlPLn-tREkHh2K2DP_YcrRh2wzEYlnEN2Vsbn/exec";

async function submitForm(e) {
    e.preventDefault();
    
    // Add visual debug
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = `
        position: fixed;
        left: 20px;
        top: 20px;
        background: rgba(255, 255, 255, 0.9);
        padding: 10px;
        border: 1px solid black;
        z-index: 9999;
        direction: ltr;
        font-family: monospace;
    `;
    document.body.appendChild(debugDiv);
    
    function updateDebug(message) {
        const time = new Date().toLocaleTimeString();
        debugDiv.innerHTML += `<div>${time}: ${message}</div>`;
    }

    updateDebug('Starting form submission...');
    
    const submitButton = document.getElementById("saveAndContinue");
    submitButton.disabled = true;
    submitButton.textContent = "שולח...";

    try {
        const form = document.querySelector("form");
        const formElement = document.querySelector(".form-content");
        
        if (!form || !formElement) {
            throw new Error("Form elements not found");
        }

        updateDebug('Creating canvas...');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: true
        });
        updateDebug('Canvas created');

        updateDebug('Creating PDF...');
        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        updateDebug('PDF created');

        const formData = new FormData(form);
        const data = {
            section: "1",
            formPdf: pdf.output("datauristring"),
            idNumber: formData.get("idNumber") || "unknown",
            timestamp: new Date().toISOString()
        };
        updateDebug('Data prepared');

        updateDebug('Sending to server...');
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        updateDebug('Server response received');
        
        // Save form data for next sections
        localStorage.setItem('formData', JSON.stringify({
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            idNumber: formData.get("idNumber"),
            email: formData.get("email"),
            phone: formData.get("phone")
        }));

        showMessage("הטופס נשלח בהצלחה", "success");
        updateDebug('Success! Moving to next section in 3 seconds...');

        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 3000);

    } catch (error) {
        console.error("[ERROR]", error);
        updateDebug(`Error: ${error.message}`);
        showMessage("שגיאה בשליחת הטופס: " + error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "המשך לשלב הבא";
    }
}

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

document.addEventListener("DOMContentLoaded", () => {
    console.log("[DEBUG] Section 1 initialized");
    
    // Verify dependencies
    if (!window.jspdf) {
        console.error("[ERROR] jsPDF not loaded");
    }
    if (!window.html2canvas) {
        console.error("[ERROR] html2canvas not loaded");
    }
    
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.addEventListener("click", submitForm);
        console.log("[DEBUG] Submit button handler attached");
    } else {
        console.error("[ERROR] Submit button not found");
    }
});
