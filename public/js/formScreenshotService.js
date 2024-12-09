class FormScreenshotService {
    constructor() {
        this.screenshots = {};
    }

    // ????? ???? ????
    async captureSingleSection(sectionNumber) {
        try {
            console.log(`[DEBUG] Capturing section ${sectionNumber}`);
            const formElement = document.querySelector(".form-content");
            
            if (!formElement) {
                throw new Error("Form content not found");
            }

            const canvas = await html2canvas(formElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff"
            });

            // ????? ??????
            const screenshot = canvas.toDataURL("image/png", 1.0);
            this.screenshots[`section${sectionNumber}`] = screenshot;

            // ????? PDF ??????? ??????
            const pdf = await this.createPDFFromScreenshot(screenshot);
            
            return {
                screenshot,
                pdf
            };
        } catch (error) {
            console.error(`[ERROR] Failed to capture section ${sectionNumber}:`, error);
            return null;
        }
    }

    // ????? PDF ?????? ????
    async createPDFFromScreenshot(screenshot) {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(screenshot);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(screenshot, "PNG", 0, 0, pdfWidth, pdfHeight);
            return pdf.output("datauristring");
        } catch (error) {
            console.error("[ERROR] PDF creation failed:", error);
            return null;
        }
    }

    // ????? PDF ??? ???????
    async createFullFormPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "mm", "a4");
            let currentPage = 0;

            for (const [section, screenshot] of Object.entries(this.screenshots)) {
                if (currentPage > 0) {
                    pdf.addPage();
                }

                const imgProps = pdf.getImageProperties(screenshot);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(screenshot, "PNG", 0, 0, pdfWidth, pdfHeight);
                currentPage++;
            }

            return pdf.output("datauristring");
        } catch (error) {
            console.error("[ERROR] Full PDF creation failed:", error);
            return null;
        }
    }
}

// ????? instance ??????
window.formScreenshotService = new FormScreenshotService();
