class FormScreenshotService {
    constructor() {
        this.sections = {};
    }

    // ????? ???? ????
    async captureSectionAsPDF(sectionNumber) {
        try {
            const formElement = document.querySelector(".form-content");
            const canvas = await html2canvas(formElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff"
            });
            
            // ???? ?PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0);
            
            this.sections[sectionNumber] = pdf.output('datauristring');
            return this.sections[sectionNumber];
        } catch (error) {
            console.error(`[ERROR] Failed to capture section ${sectionNumber}:`, error);
            return null;
        }
    }

    // ????? PDF ??? ??? ???????
    async createFullFormPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            let currentPage = 0;

            for (let i = 1; i <= 4; i++) {
                if (this.sections[i]) {
                    if (currentPage > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(this.sections[i], 'PDF', 0, 0);
                    currentPage++;
                }
            }

            return pdf.output('datauristring');
        } catch (error) {
            console.error('[ERROR] Failed to create full PDF:', error);
            return null;
        }
    }
}

window.formScreenshotService = new FormScreenshotService();
