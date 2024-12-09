async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting final form submission");

    try {
        // ????? ?? ?????
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        // ???? ?PDF
        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        pdf.addImage(imgData, "JPEG", 0, 0);
        
        // ????? ????
        const emailData = {
            to: "info@movne.co.il",
            subject: "???? ??? ?????",
            pdfContent: pdf.output("datauristring")
        };

        const response = await fetch("/api/send-form", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            throw new Error("Failed to send email");
        }

        alert("????? ???? ?????? ?????");
        window.location.href = "/sections/thank-you.html";

    } catch (error) {
        console.error("Error:", error);
        alert("????? ?????? ?????");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", submitForm);
    }
});
