// Define Google Script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEjJN6RYWQ_p5bE9iCLhIAjuqMINULfql5W_3eR45Ab1fg2t50qr4h24K5nli4kLYI/exec";

// Form validation functions
function validateIdNumber(idNumber) {
    return /^\d{9}$/.test(idNumber);
}

function validatePhone(phone) {
    return /^0\d{9}$/.test(phone);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Function to capture form data
function captureFormData(form) {
    const formData = new FormData(form);
    return Object.fromEntries(formData.entries());
}

// Main submit handler
async function submitForm(e) {
    e.preventDefault();
    console.log("[DEBUG] Starting form submission");

    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "שולח...";
    }

    try {
        // Form validation
        const form = document.querySelector("form");
        if (!form) throw new Error("Form not found");

        const formData = captureFormData(form);
        
        // Validate required fields
        if (!formData.firstName?.trim()) throw new Error("שם פרטי הוא שדה חובה");
        if (!formData.lastName?.trim()) throw new Error("שם משפחה הוא שדה חובה");
        if (!validateIdNumber(formData.idNumber)) throw new Error("מספר תעודת זהות לא תקין");
        if (!validateEmail(formData.email)) throw new Error("כתובת אימייל לא תקינה");
        if (!validatePhone(formData.phone)) throw new Error("מספר טלפון לא תקין");

        // Create PDF from form
        console.log("[DEBUG] Creating form PDF");
        const formElement = document.querySelector(".form-content");
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: true
        });

        // Convert to PDF
        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

        // Prepare data for submission
        const data = {
            ...formData,
            section: "1",
            formPdf: pdf.output("datauristring"),
            timestamp: new Date().toISOString()
        };

        // Save data to localStorage for future sections
        localStorage.setItem('formData', JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            idNumber: formData.idNumber,
            email: formData.email,
            phone: formData.phone
        }));

        console.log("[DEBUG] Sending data to server");
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("[DEBUG] Form submitted successfully");
        showMessage("הטופס נשלח בהצלחה", "success");

        // Navigate to next section
        setTimeout(() => {
            window.location.href = "/sections/section2.html";
        }, 1000);

    } catch (error) {
        console.error("[ERROR] Submit failed:", error);
        showMessage(error.message || "אירעה שגיאה בשליחת הטופס");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "המשך לשלב הבא";
        }
    }
}

// Message display function
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

// Function to pre-fill form if data exists
function loadSavedData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const form = document.querySelector("form");
        if (form) {
            Object.entries(data).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = value;
            });
        }
    }
}

// Initialize form
document.addEventListener("DOMContentLoaded", () => {
    console.log("[DEBUG] Section 1 initialized");
    
    // Check dependencies
    if (!window.jspdf) {
        console.error("[ERROR] jsPDF not loaded");
    }
    if (!window.html2canvas) {
        console.error("[ERROR] html2canvas not loaded");
    }

    // Load any saved data
    loadSavedData();
    
    // Attach submit handler
    const submitButton = document.getElementById("saveAndContinue");
    if (submitButton) {
        submitButton.addEventListener("click", submitForm);
        console.log("[DEBUG] Submit button handler attached");
    } else {
        console.error("[ERROR] Submit button not found");
    }

    // Add real-time validation listeners
    const form = document.querySelector("form");
    if (form) {
        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const errorDiv = input.parentElement.querySelector('.error-message');
                if (errorDiv) errorDiv.remove();
            });
        });
    }
});
