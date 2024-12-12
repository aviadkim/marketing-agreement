const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwyEcIDCTLT0MSt6QYNWR39qWj60NaVtYP9lLMYDydtDWE3aRn5PCTteZ9V-pZmV6oS/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] התחלת שליחת טופס");
    
    const submitButton = document.getElementById("saveAndContinue");
    submitButton.disabled = true;
    submitButton.textContent = "שולח...";

    try {
        // יצירת צילום מסך של הטופס
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

        // איסוף נתוני הטופס
        const form = document.querySelector("form");
        const formData = new FormData(form);
        const idNumber = formData.get("idNumber") || "unknown";

        const data = {
            section: "1",
            formPdf: pdf.output("datauristring"),
            idNumber: idNumber,
            timestamp: new Date().toISOString()
        };

        console.log("[DEBUG] שולח לשרת");

        // שליחה לשרת
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] התקבלה תשובה מהשרת");
        showMessage("הטופס נשלח בהצלחה", "success");

        // שמירת נתונים ומעבר לעמוד הבא
        const formDataToSave = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            idNumber: formData.get("idNumber"),
            email: formData.get("email"),
            phone: formData.get("phone")
        };
        localStorage.setItem("formData", JSON.stringify(formDataToSave));

        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR] שגיאה:", error);
        showMessage("אירעה שגיאה בשליחת הטופס");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "המשך לשלב הבא";
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
    console.log("[DEBUG] אתחול דף 1");
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.addEventListener("click", submitForm);
    }
});
