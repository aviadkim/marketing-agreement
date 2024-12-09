const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzG0PUeKWY7mr2r-nWWrBcE6w20_9Vq-se8_k8uzVEMBw0iij5qIrCWfNoz9qubq5Mk/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting final form submission");

    const submitButton = document.getElementById("finalSubmit");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "שולח...";
    }

    try {
        // בדיקת תקינות
        const form = document.querySelector("form");
        const signatureData = document.getElementById("signatureData")?.value;
        const confirmation = document.getElementById("finalConfirmation")?.checked;

        if (!form || !signatureData || !confirmation) {
            throw new Error("יש למלא את כל השדות ולחתום");
        }

        // צילום הטופס
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        // יצירת PDF
        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

        // שליחה לגוגל שיטס
        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            signature: signatureData,
            section: "4",
            timestamp: new Date().toISOString()
        };

        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // שליחת מייל עם PDF
        const emailResponse = await fetch('/api/submit-final', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pdfContent: pdf.output("datauristring"),
                email: "info@movne.co.il",
                subject: "טופס הסכם שיווק חדש",
                name: data.firstName + " " + data.lastName
            })
        });

        if (!emailResponse.ok) {
            throw new Error("שגיאה בשליחת המייל");
        }

        showMessage("הטופס נשלח בהצלחה", "success");
        setTimeout(() => {
            window.location.href = "/sections/thank-you.html";
        }, 1500);

    } catch (error) {
        console.error("[ERROR]", error);
        showMessage(error.message || "שגיאה בשליחת הטופס");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "סיים והגש טופס";
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
        // בדיקת תקינות הטופס
        const checkFormValidity = () => {
            const signature = document.getElementById("signatureData")?.value;
            const confirmation = document.getElementById("finalConfirmation")?.checked;
            submitButton.disabled = !(signature && confirmation);
        };

        // הוספת מאזינים
        form.addEventListener("change", checkFormValidity);
        form.addEventListener("submit", submitForm);
        
        // בדיקה התחלתית
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
