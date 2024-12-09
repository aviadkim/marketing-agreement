const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting section 1 submission");

    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "????...";
    }

    try {
        const form = document.querySelector("form");
        if (!form) throw new Error("Form not found");

        // Create PDF of form
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        // Convert to PDF
        const pdf = new jsPDF();
        pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0);
        const pdfData = pdf.output("datauristring");

        // Prepare form data
        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            section: "1",
            timestamp: new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }),
            formPdf: pdfData
        };

        console.log("[DEBUG] Sending data to server:", { ...data, formPdf: "[PDF DATA]" });

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] Server response:", response);
        showMessage("????? ???? ??????", "success");
        
        // Save to localStorage and navigate
        localStorage.setItem("section1Data", JSON.stringify({
            ...data,
            formPdf: "[PDF DATA]"
        }));

        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR] Section 1 submission failed:", error);
        showMessage("????? ?????? ?????");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "???? ???? ???";
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
        console.log("[DEBUG] Submit button handler attached");
    } else {
        console.error("[ERROR] Submit button not found");
    }
});
