// section4Submit.js
console.log('[DEBUG] Section4Submit script initializing');

// Initialize SignaturePad
let signaturePad;
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOM Content Loaded - Initializing SignaturePad');
    const canvas = document.getElementById('signatureCanvas');
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });
});

// Helper functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForImages(element) {
    console.log('[DEBUG] Waiting for images to load');
    const images = element.getElementsByTagName('img');
    const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
    });
    await Promise.all(promises);
    console.log('[DEBUG] All images loaded successfully');
}

// Function to check stored PDFs
function checkStoredPDFs() {
    const sections = ['formData', 'section2Data', 'section3Data'];
    const pdfs = {};
    const sectionData = {};

    console.log('[DEBUG] Checking stored data in localStorage');
    sections.forEach(key => {
        try {
            const data = localStorage.getItem(key);
            console.log(`[DEBUG] ${key}:`, data ? 'Found' : 'Not found');
            if (data) {
                const parsed = JSON.parse(data);
                sectionData[key] = parsed;
                pdfs[key] = parsed.pdfUrl || false;
            } else {
                pdfs[key] = false;
                sectionData[key] = null;
            }
        } catch (error) {
            console.error(`[ERROR] Failed to parse ${key}:`, error);
            pdfs[key] = false;
            sectionData[key] = null;
        }
    });

    return { pdfs, sectionData };
}

// PDF Creation Function with enhanced logging
async function createFinalPDF() {
    try {
        console.log('[DEBUG] Starting final PDF creation');
        const { pdfs, sectionData } = checkStoredPDFs();
        console.log('[DEBUG] Found PDFs:', pdfs);
        console.log('[DEBUG] Section Data:', sectionData);

        window.jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        console.log('[DEBUG] PDF settings:', {
            pageWidth: pdf.internal.pageSize.width,
            pageHeight: pdf.internal.pageSize.height,
            unit: pdf.internal.scaleFactor
        });

        // Function to add section to PDF with enhanced logging
        async function addSectionToPDF(sectionData, pageTitle, index) {
            console.log(`[DEBUG] Processing section ${index}: ${pageTitle}`);
            if (!sectionData) {
                console.warn(`[WARNING] No data found for ${pageTitle}`);
                return false;
            }

            // Add page if not first page
            if (pdf.internal.getCurrentPageInfo().pageNumber !== 1) {
                pdf.addPage();
                console.log(`[DEBUG] Added new page for section ${index}`);
            }

            // Add page title
            pdf.setFontSize(16);
            pdf.text(pageTitle, 20, 20);

            try {
                if (sectionData.pdfUrl) {
                    console.log(`[DEBUG] Found PDF URL for section ${index}:`, sectionData.pdfUrl);
                    const response = await fetch(sectionData.pdfUrl);
                    const blob = await response.blob();
                    console.log(`[DEBUG] Section ${index} PDF blob size:`, blob.size);
                    
                    const reader = new FileReader();
                    const dataUrl = await new Promise((resolve, reject) => {
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    
                    pdf.addImage(dataUrl, 'JPEG', 0, 30, 210, 297);
                    console.log(`[DEBUG] Section ${index} added to PDF successfully`);
                    return true;
                } else {
                    console.warn(`[WARNING] No PDF URL found for section ${index}`);
                    return false;
                }
            } catch (error) {
                console.error(`[ERROR] Failed to add section ${index}:`, error);
                return false;
            }
        }

        // Add each section with status tracking
        const results = {
            section1: await addSectionToPDF(sectionData.formData, 'פרטים אישיים', 1),
            section2: await addSectionToPDF(sectionData.section2Data, 'פרטי השקעה', 2),
            section3: await addSectionToPDF(sectionData.section3Data, 'שאלון סיכון', 3)
        };

        console.log('[DEBUG] Section processing results:', results);

        // Add current section (4)
        console.log('[DEBUG] Processing section 4');
        const section4Element = document.querySelector('.form-content');
        if (!section4Element) {
            throw new Error('Section 4 element not found');
        }

        await waitForImages(section4Element);
        const canvas = await html2canvas(section4Element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true
        });

        console.log('[DEBUG] Section 4 canvas created:', {
            width: canvas.width,
            height: canvas.height
        });

        pdf.addPage();
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        console.log('[DEBUG] Section 4 added successfully');

        const finalPdfBlob = pdf.output('blob');
        console.log('[DEBUG] Final PDF created, size:', finalPdfBlob.size);

        return finalPdfBlob;
    } catch (error) {
        console.error('[ERROR] PDF creation failed:', error);
        throw error;
    }
}

// Submit handler with enhanced error handling
async function submitFinalForm(e) {
    e.preventDefault();
    console.log('[DEBUG] Starting final form submission');

    const submitButton = document.getElementById('finalSubmit');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');

    try {
        // Validate form
        const form = document.getElementById('section4-form');
        if (!form) {
            throw new Error('Form element not found');
        }

        if (!form.checkValidity()) {
            console.warn('[WARNING] Form validation failed');
            form.reportValidity();
            return;
        }

        // Validate signature
        if (!signaturePad || signaturePad.isEmpty()) {
            throw new Error('נדרשת חתימה דיגיטלית');
        }

        // Update UI
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        // Create final PDF
        const pdfBlob = await createFinalPDF();
        console.log('[DEBUG] Final PDF created, size:', pdfBlob.size);

        // Get user data
        const userData = JSON.parse(localStorage.getItem('formData') || '{}');
        console.log('[DEBUG] User data retrieved:', userData);
        
        // Upload to Firebase
        const fileName = `forms/complete_${userData.firstName}_${userData.lastName}_${userData.idNumber}_${Date.now()}.pdf`;
        const storageRef = window.storage.ref().child(fileName);
        
        console.log('[DEBUG] Starting Firebase upload');
        const uploadTask = await storageRef.put(pdfBlob, {
            contentType: 'application/pdf',
            customMetadata: {
                type: 'complete_form',
                idNumber: userData.idNumber,
                timestamp: new Date().toISOString()
            }
        });

        const pdfUrl = await uploadTask.ref.getDownloadURL();
        console.log('[DEBUG] PDF uploaded successfully, URL:', pdfUrl);

        // Save to Firestore
        const formData = new FormData(form);
        const finalFormData = {
            type: 'complete_form',
            fileName,
            pdfUrl,
            idNumber: userData.idNumber,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            declarations: {
                riskAcknowledgement: formData.get('riskAcknowledgement') === 'on',
                independentDecision: formData.get('independentDecision') === 'on',
                updateCommitment: formData.get('updateCommitment') === 'on',
                finalConfirmation: formData.get('finalConfirmation') === 'on'
            },
            signature: signaturePad.toDataURL(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        console.log('[DEBUG] Saving to Firestore:', finalFormData);
        await window.db.collection('complete_forms').add(finalFormData);

        showMessage('הטופס נשלח בהצלחה!', 'success');
        
        // Clear localStorage and redirect
        setTimeout(() => {
            localStorage.clear();
            window.location.href = '/sections/thank-you.html';
        }, 1500);

    } catch (error) {
        console.error('[ERROR] Form submission failed:', error);
        showMessage(error.message || 'אירעה שגיאה בשליחת הטופס');
    } finally {
        submitButton.disabled = false;
        buttonText.style.opacity = '1';
        buttonLoader.style.display = 'none';
    }
}

// Attach submit handler
document.getElementById('finalSubmit').addEventListener('click', submitFinalForm);

// Export for testing
window.createFinalPDF = createFinalPDF;
window.submitFinalForm = submitFinalForm;
