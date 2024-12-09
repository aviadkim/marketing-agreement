async function saveFormFiles(data, sectionNum) {
    try {
        // ????? ??? ?? ?????
        const formElement = document.querySelector('.form-content');
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        
        // ???? ?-PDF
        const pdf = new jsPDF();
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0);
        
        data.formPdf = pdf.output('datauristring');
        data.section = sectionNum;
        data.timestamp = new Date().toISOString();

        return data;
    } catch (error) {
        console.error('Error saving files:', error);
        throw error;
    }
}
