const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting final form submission");

    try {
        const form = document.querySelector("form");
        if (!form) throw new Error("Form not found");

        // ????? ???? 4
        const section4PDF = await window.formScreenshotService.captureSectionAsPDF(4);
        
        // ????? PDF ???
        const fullFormPDF = await window.formScreenshotService.createFullFormPDF();

        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            section: "4",
            sectionPDF: section4PDF,
            fullFormPDF: fullFormPDF,
            timestamp: new Date().toISOString()
        };

        console.log("[DEBUG] Sending final data");

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] Final submission successful");
        showMessage("????? ????? ??????", "success");

        setTimeout(() => {
            window.location.href = "/sections/thank-you.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR] Final submission failed:", error);
        showMessage("????? ?????? ?????");
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
    }
});
