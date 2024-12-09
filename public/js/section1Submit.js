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

        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            section: "1",
            timestamp: new Date().toISOString(),
            formScreenshot: await captureFormScreenshot()
        };

        console.log("[DEBUG] Sending data to server:", data);

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // Important for CORS
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] Server response:", response);

        // Save to localStorage for verification
        localStorage.setItem("section1Data", JSON.stringify({
            ...data,
            formScreenshot: "[SCREENSHOT DATA]"
        }));

        // Navigate to next section
        window.location.href = "/sections/section2.html";
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

async function captureFormScreenshot() {
    try {
        const formElement = document.querySelector(".form-content");
        if (!formElement) return null;
        
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });
        
        return canvas.toDataURL("image/png");
    } catch (error) {
        console.error("[ERROR] Screenshot capture failed:", error);
        return null;
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
