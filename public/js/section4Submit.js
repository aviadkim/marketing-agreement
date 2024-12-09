async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting final form submission");

    const submitButton = document.getElementById("finalSubmit");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "????...";
    }

    try {
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

        const response = await fetch("/api/submit-final", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pdfContent: pdf.output("datauristring")
            })
        });

        if (!response.ok) throw new Error("Failed to send form");

        console.log("[DEBUG] Form sent successfully");
        alert("????? ???? ??????!");
        window.location.href = "/sections/thank-you.html";

    } catch (error) {
        console.error("[ERROR] Form submission failed:", error);
        alert("????? ?????? ?????");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "??? ????";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("[DEBUG] Initializing final submit");
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", submitForm);
        console.log("[DEBUG] Submit handler attached");
    }
});
