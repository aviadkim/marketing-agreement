const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting form submission");

    const submitButton = document.getElementById("finalSubmit");
    if (submitButton) {
        submitButton.disabled = true;
        const buttonText = submitButton.querySelector(".button-text");
        if (buttonText) buttonText.textContent = "שולח...";
    }

    try {
        const form = document.querySelector("form");
        const signatureData = document.getElementById("signatureData")?.value;
        
        if (!form || !signatureData) {
            throw new Error("נא למלא את כל השדות הנדרשים");
        }

        // Get form data
        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            signature: signatureData,
            section: "4",
            timestamp: new Date().toISOString()
        };

        console.log("[DEBUG] Sending form data");

        // Send to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] Form submitted successfully");
        showMessage("הטופס נשלח בהצלחה", "success");
        
        setTimeout(() => {
            window.location.href = "/sections/thank-you.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR]", error);
        showMessage(error.message || "שגיאה בשליחת הטופס");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            const buttonText = submitButton.querySelector(".button-text");
            if (buttonText) buttonText.textContent = "סיים והגש טופס";
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
    console.log("[DEBUG] Section 4 initialized");
    
    const form = document.querySelector("form");
    const submitButton = document.getElementById("finalSubmit");

    if (form && submitButton) {
        const checkFormValidity = () => {
            const signature = document.getElementById("signatureData")?.value;
            const confirmation = document.getElementById("finalConfirmation")?.checked;
            submitButton.disabled = !(signature && confirmation);
        };

        form.addEventListener("change", checkFormValidity);
        form.addEventListener("submit", submitForm);
        
        // Initial check
        checkFormValidity();
    }
});
