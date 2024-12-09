async function captureAllPages() {
    const pages = [];
    
    for (let i = 1; i <= 4; i++) {
        try {
            const iframe = document.createElement("iframe");
            iframe.style.width = "1024px";
            iframe.style.height = "2000px";
            iframe.style.position = "absolute";
            iframe.style.left = "-9999px";
            document.body.appendChild(iframe);

            await new Promise((resolve) => {
                iframe.onload = resolve;
                iframe.src = `/sections/section${i}.html`;
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            const formContent = iframe.contentDocument.querySelector(".form-content");
            if (formContent) {
                const canvas = await html2canvas(formContent, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    windowWidth: 1024,
                    windowHeight: 2000
                });

                // ????? ?-PDF ??????
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF("p", "mm", "a4");
                const imgData = canvas.toDataURL("image/jpeg", 1.0);
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
                
                pages.push(pdf.output("datauristring"));
            }

            document.body.removeChild(iframe);
        } catch (error) {
            console.error(`Error capturing section ${i}:`, error);
        }
    }
    return pages;
}

async function createFullPDF(pages) {
    try {
        const { jsPDF } = window.jspdf;
        const fullPdf = new jsPDF("p", "mm", "a4");
        
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) {
                fullPdf.addPage();
            }
            
            // ???? ?-base64 ???? ?-PDF
            const pageData = pages[i].split(",")[1];
            const pagePdf = new jsPDF();
            pagePdf.loadFile(pageData);
            
            // ????? ?PDF ????
            fullPdf.addPage(pagePdf.getPage(1));
        }
        
        return fullPdf.output("datauristring");
    } catch (error) {
        console.error("Error creating full PDF:", error);
        return null;
    }
}

export { captureAllPages, createFullPDF };
