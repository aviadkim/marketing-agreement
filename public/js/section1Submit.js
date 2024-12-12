const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyVzyS8-nQwhNPhInyVDzrkoFYk1pCdKx5UNinjvtvViIgoxYuwsJOIKiLI5zNPW80/exec";

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting form submission");
    
    const submitButton = document.getElementById("saveAndContinue");
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');
    
    try {
        // Disable button and show loader
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        // Capture form screenshot
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        // Convert to PDF
        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/png", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // Get form data
        const form = document.querySelector("form");
        const formData = new FormData(form);

        // Prepare data for submission
        const data = {
            section: "1",
            formPdf: pdf.output("datauristring"),
            submitScreenshot: canvas.toDataURL("image/png", 1.0),
            timestamp: new Date().toISOString(),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            idNumber: formData.get("idNumber"),
            email: formData.get("email"),
            phone: formData.get("phone")
        };

        console.log("[DEBUG] Sending data to server");
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] Form submitted successfully");
        showMessage("הטופס נשלח בהצלחה", "success");

        // Store data for next sections
        localStorage.setItem('formData', JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            idNumber: data.idNumber,
            email: data.email,
            phone: data.phone
        }));

        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR]", error);
        showMessage("שגיאה בשליחת הטופס");
    } finally {
        submitButton.disabled = false;
        buttonText.style.opacity = '1';
        buttonLoader.style.display = 'none';
    }
}
