const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrwLGbjBzrjc9sgHa2wEDryXMrZocmliFheT6qS43Rzp8qv1hLYzj11BD7zrgUba1w/exec";

class PDFSubmissionService {
    constructor() {
        console.log('[DEBUG] PDFSubmissionService initialized');
    }

    async createPDF(formElement) {
        try {
            console.log('[DEBUG] Starting PDF creation');
            
            const canvas = await html2canvas(formElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: true, // Enable html2canvas logging
                onclone: function(clonedDoc) {
                    console.log('[DEBUG] Document cloned for PDF creation');
                }
            });
            console.log('[DEBUG] Canvas created successfully');

            window.jsPDF = window.jspdf.jsPDF;
            const pdf = new jsPDF();
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            console.log('[DEBUG] Image data created, size:', imgData.length);

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            
            console.log('[DEBUG] PDF created successfully');
            return pdf.output("datauristring");
        } catch (error) {
            console.error('[ERROR] PDF creation failed:', error);
            throw new Error(`PDF creation failed: ${error.message}`);
        }
    }

    async sendToGoogleDrive(data) {
        try {
            console.log('[DEBUG] Sending data to Google Drive');
            console.log('[DEBUG] Using URL:', GOOGLE_SCRIPT_URL);
            
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            console.log('[DEBUG] Response received from Google Drive');
            return response;
        } catch (error) {
            console.error('[ERROR] Google Drive submission failed:', error);
            throw new Error(`Drive submission failed: ${error.message}`);
        }
    }
}

// Main submit handler
async function submitForm(e) {
    e.preventDefault();
    const service = new PDFSubmissionService();
    const submitButton = document.getElementById("saveAndContinue");
    
    try {
        console.log('[DEBUG] Starting form submission process');
        
        // Disable button and show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "שולח...";
            console.log('[DEBUG] Submit button disabled');
        }

        // Validate form elements
        const form = document.querySelector("form");
        const formElement = document.querySelector(".form-content");
        
        if (!form || !formElement) {
            throw new Error("Required form elements not found");
        }
        console.log('[DEBUG] Form elements validated');

        // Create PDF
        const pdfData = await service.createPDF(formElement);
        console.log('[DEBUG] PDF created');

        // Collect form data
        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            section: "1",
            formPdf: pdfData,
            timestamp: new Date().toISOString()
        };
        console.log('[DEBUG] Form data collected:', Object.keys(data));

        // Send to Google Drive
        await service.sendToGoogleDrive(data);
        console.log('[DEBUG] Data sent to Google Drive');

        // Show success message
        showMessage("הטופס נשלח בהצלחה", "success");
        
        // Navigate to next section
        console.log('[DEBUG] Preparing to navigate to next section');
        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 1000);

    } catch (error) {
        console.error('[ERROR] Form submission failed:', error);
        showMessage(`שגיאה בשליחת הטופס: ${error.message}`);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "המשך לשלב הבא";
            console.log('[DEBUG] Submit button re-enabled');
        }
    }
}

// Success/Error message handler
function showMessage(message, type = "error") {
    console.log(`[${type.toUpperCase()}] Showing message:`, message);
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

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log('[DEBUG] Section 1 initialized');
    console.log('[DEBUG] Checking for dependencies...');
    
    // Verify required dependencies
    if (!window.jspdf) {
        console.error('[ERROR] jsPDF not loaded');
    }
    if (!window.html2canvas) {
        console.error('[ERROR] html2canvas not loaded');
    }
    
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.addEventListener("click", submitForm);
        console.log('[DEBUG] Submit button event listener attached');
    } else {
        console.error('[ERROR] Submit button not found');
    }
});
