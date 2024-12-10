const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting form submission");

    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
    }

    try {
        const form = document.querySelector("form");
        if (!form) throw new Error("Form not found");

        // Capture section 1 content as an image
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        // Convert the image to PDF
        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        const pdfBase64 = pdf.output("datauristring").split(",")[1];

        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            section: "1",
            formPdf: pdfBase64,
            timestamp: new Date().toISOString()
        };

        console.log("[DEBUG] Sending data to Google Sheets");

        // Send data to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] Data sent to Google Sheets successfully");

        // Send PDF as email attachment
        const emailResponse = await fetch('/api/send-email', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ pdfBase64, ...data })
        });

        if (emailResponse.ok) {
            console.log("[DEBUG] Email sent successfully");
            showMessage("Form submitted successfully", "success");
        } else {
            throw new Error('Email sending failed');
        }

        // Redirect to section 2
        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR] Submit failed:", error);
        showMessage("Submission failed");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Submit";
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
