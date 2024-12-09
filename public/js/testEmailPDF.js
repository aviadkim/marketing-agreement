const EMAIL_ENDPOINT = "/api/test-email";

async function testEmailWithPDF() {
    try {
        console.log("[DEBUG] Starting test email with PDF");

        // ????? ?? ???? 1 ????
        const formSection = document.querySelector(".form-content");
        const canvas = await html2canvas(formSection, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        // ????? PDF ????
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        pdf.addImage(imgData, "JPEG", 0, 0);

        // ?????? ????? ????
        const emailData = {
            to: "info@movne.co.il",
            subject: "????? - ????? ???? 1",
            pdfBase64: pdf.output("datauristring")
        };

        const response = await fetch(EMAIL_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(emailData)
        });

        console.log("[DEBUG] Test email sent:", response);
        alert("???? ???? ??????");

    } catch (error) {
        console.error("[ERROR] Test failed:", error);
        alert("????? ?????? ?????");
    }
}

// ????? ?????
document.addEventListener("DOMContentLoaded", () => {
    const testButton = document.createElement("button");
    testButton.textContent = "??? ???? ??????";
    testButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 10px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    testButton.onclick = testEmailWithPDF;
    document.body.appendChild(testButton);
});
