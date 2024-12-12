const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEjJN6RYWQ_p5bE9iCLhIAjuqMINULfql5W_3eR45Ab1fg2t50qr4h24K5nli4kLYI/exec";

// Add the missing function
async function testGoogleConnection() {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log('[DEBUG] Google connection test:', response.ok);
        return response.ok;
    } catch (error) {
        console.error('[ERROR] Google connection test failed:', error);
        return false;
    }
}

async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting form submission");
    
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "שולח...";
    }

    try {
        // Test connection first
        const isConnected = await testGoogleConnection();
        console.log('[DEBUG] Google connection status:', isConnected);

        // Get form content
        const formElement = document.querySelector(".form-content");
        if (!formElement) {
            throw new Error("Form element not found");
        }

        console.log('[DEBUG] Creating canvas');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: true
        });

        console.log('[DEBUG] Creating PDF');
        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

        // Get form data
        const form = document.querySelector("form");
        const formData = new FormData(form);
        
        const data = {
            section: "1",
            formPdf: pdf.output("datauristring"),
            timestamp: new Date().toISOString()
        };

        console.log('[DEBUG] Sending to Google Drive');
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });

        console.log('[DEBUG] Google Drive response:', response);

        if (response.ok) {
            console.log('[DEBUG] Form submitted successfully');
            showMessage("הטופס נשלח בהצלחה", "success");
            
            setTimeout(() => {
                window.location.href = "/sections/section2.html";
            }, 1000);
        } else {
            throw new Error('Server response was not OK');
        }

    } catch (error) {
        console.error("[ERROR] Submit failed:", error);
        showMessage("שגיאה בשליחת הטופס: " + error.message);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "המשך לשלב הבא";
        }
    }
}

function showMessage(message, type = "error") {
    console.log(`[${type.toUpperCase()}] ${message}`);
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

// Initialize form
document.addEventListener("DOMContentLoaded", () => {
    console.log("[DEBUG] Section 1 initialized");
    
    // Verify dependencies
    if (!window.jspdf) {
        console.error("[ERROR] jsPDF not loaded");
    }
    if (!window.html2canvas) {
        console.error("[ERROR] html2canvas not loaded");
    }
    
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.addEventListener("click", submitForm);
        console.log("[DEBUG] Submit button handler attached");
    } else {
        console.error("[ERROR] Submit button not found");
    }

    // Test Google connection on page load
    testGoogleConnection().then(isConnected => {
        console.log('[DEBUG] Initial Google connection test:', isConnected);
    });
});
