const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting form submission");

    const submitButton = document.getElementById("finalSubmit");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '????...';
    }

    try {
        const form = document.querySelector("form");
        const signatureData = document.getElementById("signatureData")?.value;
        
        if (!form || !signatureData) {
            showMessage("?? ?????? ?? ?? ????? ???????");
            return;
        }

        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            signature: signatureData,
            timestamp: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
            formScreenshot: await captureFormScreenshot()
        };

        console.log("[DEBUG] Sending data", data);

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok && response.status !== 0) {
            throw new Error(`????? ??????: ${response.status}`);
        }

        showMessage("????? ???? ??????", "success");
        
        setTimeout(() => {
            window.location.href = "/sections/thank-you.html";
        }, 1500);

    } catch (error) {
        console.error("[ERROR]", error);
        showMessage("????? ?????? ?????");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = '???? ???? ????';
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

        const dataUrl = canvas.toDataURL('application/pdf');
        return dataUrl;
    } catch (error) {
        console.error("[ERROR] Screenshot failed:", error);
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
    console.log("[DEBUG] Section 4 initialized");
    
    const submitButton = document.getElementById("finalSubmit");
    if (submitButton) {
        submitButton.addEventListener("click", submitForm);
    } else {
        console.error("[ERROR] Submit button not found");
    }
});
