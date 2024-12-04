async function captureAllPages() {
    const pages = [];
    
    // Capture current section state
    const currentUrl = window.location.pathname;
    
    // Try to capture each section
    for (let i = 1; i <= 4; i++) {
        try {
            // Create temporary iframe
            const iframe = document.createElement('iframe');
            iframe.style.width = '1024px';
            iframe.style.height = '2000px';
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            document.body.appendChild(iframe);
            
            // Load section content
            await new Promise((resolve, reject) => {
                iframe.onload = resolve;
                iframe.src = `/sections/section${i}.html`;
            });
            
            // Wait for content to render
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Capture section content
            const formContent = iframe.contentDocument.querySelector('.form-content');
            if (formContent) {
                const canvas = await html2canvas(formContent, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    windowWidth: 1024,
                    windowHeight: 2000
                });
                pages.push(canvas.toDataURL('image/png', 1.0));
            }
            
            // Cleanup
            document.body.removeChild(iframe);
        } catch (error) {
            console.error(`Error capturing section ${i}:`, error);
        }
    }
    
    return pages;
}

async function createPDF(pages) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
            doc.addPage();
        }
        
        try {
            const imgProps = doc.getImageProperties(pages[i]);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            doc.addImage(pages[i], 'PNG', 0, 0, pdfWidth, pdfHeight);
        } catch (error) {
            console.error(`Error adding page ${i + 1} to PDF:`, error);
        }
    }
    
    return doc.output('datauristring');
}

export { captureAllPages, createPDF };
