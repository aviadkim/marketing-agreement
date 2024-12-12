const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrwLGbjBzrjc9sgHa2wEDryXMrZocmliFheT6qS43Rzp8qv1hLYzj11BD7zrgUba1w/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] התחלת שליחת טופס");
    
    const submitButton = document.getElementById("saveAndContinue");
    const loadingText = "שולח...";
    const originalText = submitButton.textContent;
    
    try {
        // השבתת כפתור השליחה
        submitButton.disabled = true;
        submitButton.textContent = loadingText;

        // יצירת PDF מהטופס
        console.log("[DEBUG] מתחיל יצירת PDF");
        const formElement = document.querySelector(".form-content");
        if (!formElement) throw new Error("לא נמצא אלמנט הטופס");

        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: true
        });

        console.log("[DEBUG] יצירת PDF");
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
        const data = {
            ...Object.fromEntries(formData.entries()),
            section: "1",
            formPdf: pdf.output("datauristring"),
            timestamp: new Date().toISOString()
        };

        console.log("[DEBUG] שולח נתונים לשרת");
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] הטופס נשלח בהצלחה");
        showMessage("הטופס נשלח בהצלחה", "success");

        // מעבר לעמוד הבא
        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR] שליחה נכשלה:", error);
        showMessage("אירעה שגיאה בשליחת הטופס");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
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
    console.log("[DEBUG] אתחול סקשן 1");
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.addEventListener("click", submitForm);
    }
});
