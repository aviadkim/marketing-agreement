const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKIS5nbJFMOCgLNZEsIFm0eWuGqkWb8v-1CqjAqHiM8iZ3VTrnKakaOg3PPjCiwOAM/exec';

function generateDownloadUrl(formData) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}_${formData.idNumber}`;
    return `${window.location.origin}/form/${uniqueId}`;
}

async function capturePageScreenshot() {
    try {
        const formElement = document.querySelector('.form-content');
        if (!formElement) return null;
        
        const canvas = await html2canvas(formElement, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true,
            width: formElement.offsetWidth,
            height: formElement.offsetHeight * 1.5
        });
        return canvas.toDataURL('image/jpeg', 0.7);
    } catch (error) {
        console.error('Error capturing page:', error);
        return null;
    }
}

async function captureAllPages() {
    const pages = [];
    
    for (let i = 1; i <= 4; i++) {
        try {
            const response = await fetch(`/sections/section${i}.html`);
            const html = await response.text();
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv);
            
            const formContent = tempDiv.querySelector('.form-content');
            if (formContent) {
                const canvas = await html2canvas(formContent, {
                    scale: 1.5,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: true,
                    width: formContent.offsetWidth,
                    height: formContent.offsetHeight * 1.5
                });
                pages.push(canvas.toDataURL('image/jpeg', 0.7));
            }
            
            document.body.removeChild(tempDiv);
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`Error capturing section ${i}:`, error);
        }
    }
    
    return pages;
}

async function createPDF(pages) {
    if (!window.jspdf) {
        console.error('jsPDF library not loaded');
        return null;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) {
                doc.addPage();
            }
            
            const imgProps = doc.getImageProperties(pages[i]);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            doc.addImage(pages[i], 'JPEG', 0, 0, pdfWidth, pdfHeight, null, 'FAST');
        }
        
        return doc.output('datauristring', { compress: true });
    } catch (error) {
        console.error('Error creating PDF:', error);
        return null;
    }
}

async function processFormData() {
    const formData = {};
    
    for (let i = 1; i <= 4; i++) {
        const sectionData = localStorage.getItem(`section${i}Data`);
        if (sectionData) {
            try {
                Object.assign(formData, JSON.parse(sectionData));
            } catch (error) {
                console.error(`Error parsing section ${i} data:`, error);
            }
        }
    }

    ['riskAcknowledgement', 'independentDecision', 'updateCommitment'].forEach(field => {
        formData[field] = formData[field] === 'on' || formData[field] === true ? 'כן' : 'לא';
    });

    let signatureData = document.getElementById('signatureData')?.value || formData.signature || '';

    console.log('Capturing current page...');
    const currentPageScreenshot = await capturePageScreenshot();

    console.log('Capturing all pages...');
    const pages = await captureAllPages();
    console.log('Pages captured:', pages.length);
    
    const pdfData = await createPDF(pages);
    console.log('PDF created:', pdfData ? 'success' : 'failed');

    // Add download URL
    formData.downloadUrl = generateDownloadUrl(formData);

    return {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        idNumber: formData.idNumber || '',
        email: formData.email || '',
        phone: formData.phone || '',
        investmentAmount: formData.investmentAmount || '',
        bank: formData.bank || '',
        currency: formData.currency || '',
        purpose: Array.isArray(formData.purpose) ? formData.purpose.join(', ') : formData.purpose || '',
        purposeOther: formData.purposeOther || '',
        timeline: formData.timeline || '',
        marketExperience: Array.isArray(formData.marketExperience) ? 
            formData.marketExperience.join(', ') : formData.marketExperience || '',
        riskTolerance: formData.riskTolerance || '',
        lossResponse: formData.lossResponse || '',
        investmentKnowledge: Array.isArray(formData.investmentKnowledge) ? 
            formData.investmentKnowledge.join(', ') : formData.investmentKnowledge || '',
        investmentRestrictions: formData.investmentRestrictions || '',
        riskAcknowledgement: formData.riskAcknowledgement || 'לא',
        independentDecision: formData.independentDecision || 'לא',
        updateCommitment: formData.updateCommitment || 'לא',
        signature: signatureData,
        currentPageScreenshot: currentPageScreenshot,
        formPDF: pdfData,
        downloadUrl: formData.downloadUrl,
        submissionDate: new Date().toISOString()
    };
}

function validateFormData(formData) {
    const requiredFields = ['firstName', 'lastName', 'idNumber', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`חסרים שדות חובה: ${missingFields.join(', ')}`);
    }
    
    if (!formData.signature) {
        throw new Error('חתימה נדרשת');
    }

    return true;
}

async function submitFormToGoogleSheets() {
    try {
        showMessage('מעבד את הטופס...', 'info');
        
        const formData = await processFormData();
        console.log('Processing form data:', { 
            ...formData, 
            signature: '[HIDDEN]', 
            currentPageScreenshot: '[HIDDEN]',
            formPDF: formData.formPDF ? '[PDF DATA]' : 'null' 
        });

        validateFormData(formData);
        showMessage('שולח את הטופס...', 'info');

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        showMessage('הטופס נשלח בהצלחה', 'success');
        window.location.href = formData.downloadUrl;
        return true;

    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        throw error;
    }
}

function showMessage(message, type = 'error') {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const div = document.createElement('div');
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
        background: ${
            type === 'success' ? '#4CAF50' : 
            type === 'info' ? '#2196F3' : 
            '#dc3545'
        };
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    
    if (type !== 'info') {
        setTimeout(() => div.remove(), 3000);
    }
}

function clearFormData() {
    for (let i = 1; i <= 4; i++) {
        localStorage.removeItem(`section${i}Data`);
    }
    localStorage.removeItem('lastSignature');
}

window.submitFormToGoogleSheets = submitFormToGoogleSheets;
window.showMessage = showMessage;
window.clearFormData = clearFormData;

document.addEventListener('DOMContentLoaded', () => {
    // html2canvas is automatically initialized when loaded
});
