const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting form submission");

    // ????? ??????
    const submitButton = document.getElementById("finalSubmit");
    if (submitButton) {
        submitButton.disabled = true;
        const buttonText = submitButton.querySelector(".button-text");
        if (buttonText) buttonText.textContent = "????...";
    }

    try {
        // ????? ?????? ?????
        const form = document.querySelector("form");
        const signatureData = document.getElementById("signatureData")?.value;
        const confirmation = document.getElementById("finalConfirmation")?.checked;

        if (!form || !signatureData || !confirmation) {
            showMessage("?? ???? ?? ?? ????? ??????", "error");
            return;
        }

        // ????? PDF
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0);
        const pdfData = pdf.output("datauristring");

        // ????? ????? ????
        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            signature: signatureData,
            section: "4",
            timestamp: new Date().toISOString(),
            pdf: pdfData
        };

        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // ????? ????
        await fetch('/api/submit-final', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pdfContent: pdfData,
                email: "info@movne.co.il",
                subject: "???? ??? ?????"
            })
        });

        showMessage("????? ???? ??????", "success");
        setTimeout(() => {
            window.location.href = "/sections/thank-you.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR]", error);
        showMessage("????? ?????? ?????");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            const buttonText = submitButton.querySelector(".button-text");
            if (buttonText) buttonText.textContent = "???? ???? ????";
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
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("[DEBUG] Section 4 initialized");

    const form = document.querySelector("form");
    const submitButton = document.getElementById("finalSubmit");

    if (form && submitButton) {
        // ????? ?????? ?????
        const checkFormValidity = () => {
            console.log("[DEBUG] Checking form validity");
            const signature = document.getElementById("signatureData")?.value;
            const confirmation = document.getElementById("finalConfirmation")?.checked;
            submitButton.disabled = !(signature && confirmation);
        };

        // ????? ??????? ????????
        form.addEventListener("change", checkFormValidity);
        form.addEventListener("submit", submitForm);
        
        // ????? ???????
        checkFormValidity();
    }
});

window.checkFormValidity = () => {
    const submitButton = document.getElementById("finalSubmit");
    const signature = document.getElementById("signatureData")?.value;
    const confirmation = document.getElementById("finalConfirmation")?.checked;
    if (submitButton) {
        submitButton.disabled = !(signature && confirmation);
    }
};
