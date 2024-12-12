class FormSubmitService {
  constructor(googleScriptUrl) {
    this.GOOGLE_SCRIPT_URL = googleScriptUrl;
  }

  async captureAndSubmit(formElement, section, nextPageUrl) {
    try {
      // יצירת PDF מהטופס
      const pdf = await this.createPDF(formElement);
      
      // שליחת הנתונים
      await this.submitToGoogleDrive(pdf, section);

      // מעבר לעמוד הבא
      this.navigateToNextPage(nextPageUrl);
      
    } catch (error) {
      console.error('שגיאה בשליחת הטופס:', error);
      this.showMessage('אירעה שגיאה בשליחת הטופס', 'error');
    }
  }

  async createPDF(formElement) {
    const canvas = await html2canvas(formElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    window.jsPDF = window.jspdf.jsPDF;
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    return pdf.output('datauristring');
  }

  async submitToGoogleDrive(pdfData, section) {
    const data = {
      formPdf: pdfData,
      section: section,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(this.GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    this.showMessage('הטופס נשלח בהצלחה', 'success');
    return response;
  }

  navigateToNextPage(url) {
    setTimeout(() => {
      window.location.href = url;
    }, 1000);
  }

  showMessage(message, type = 'error') {
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
      background: ${type === 'success' ? '#4CAF50' : '#dc3545'};
      animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }
}
