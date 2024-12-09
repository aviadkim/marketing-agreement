const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting section 3 submission");

    try {
        const form = document.querySelector("form");
        const screenData = await captureFormScreenshot();

        if (!form) {
            showMessage("???? ?? ????");
            return;
        }

        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            section: "3",
            formScreenshot: screenData,
            timestamp: new Date().toISOString()
        };

        console.log("[DEBUG] Sending section 3 data");

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] Response:", response);
        localStorage.setItem("section3Data", JSON.stringify({...data, formScreenshot: "[SAVED]"}));
        showMessage("??????? ????? ??????", "success");
        
        setTimeout(() => {
            window.location.href = "/sections/section4.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR] Submit failed:", error);
        showMessage("????? ?????? ?????");
    }
}

async function captureFormScreenshot() {
    try {
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });
        return canvas.toDataURL("image/png");
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
    console.log("[DEBUG] Section 3 initialized");
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.addEventListener("click", submitForm);
    } else {
        console.error("[ERROR] Submit button not found");
    }
});
