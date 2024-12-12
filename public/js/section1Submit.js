const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEjJN6RYWQ_p5bE9iCLhIAjuqMINULfql5W_3eR45Ab1fg2t50qr4h24K5nli4kLYI/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting form submission");
    
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "שולח...";
    }

    try {
        // Create PDF
        console.log("[DEBUG] Creating PDF");
        const formElement = document.querySelector(".form-content");
        if (!formElement) throw new Error("Form element not found");

        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });
        console.log("[DEBUG] Canvas created");

        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        console.log("[DEBUG] PDF created");

        // Get form data
        const formData = new FormData(document.querySelector("form"));
        const data = {
            section: "1",
            formPdf: pdf.output("datauristring"),
            idNumber: formData.get("idNumber") || "",
            timestamp: new Date().toISOString()
        };
        console.log("[DEBUG] Sending data to server");

        // Send to Google Drive
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        console.log("[DEBUG] Server response:", response);
        showMessage("הטופס נשלח בהצלחה", "success");

        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR] Submit failed:", error);
        showMessage("שגיאה בשליחת הטופס");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "המשך לשלב הבא";
        }
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
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.addEventListener("click", submitForm);
    }
});
