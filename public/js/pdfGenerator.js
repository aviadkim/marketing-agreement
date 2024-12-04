async function createPDF(pages) {
    // Try browser-side PDF generation first
    const browserPDF = await createBrowserPDF(pages);
    if (browserPDF && browserPDF.size < 10000000) { // Less than 10MB
        return browserPDF;
    }
    
    // Fallback to server-side generation
    return await createServerPDF(pages);
}

async function createBrowserPDF(pages) {
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
            compress: true,
            putOnlyUsedFonts: true
        });
        
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) doc.addPage();
            
            // Compress image before adding to PDF
            const compressedImage = await compressImage(pages[i]);
            const imgProps = doc.getImageProperties(compressedImage);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            doc.addImage(compressedImage, 'JPEG', 0, 0, pdfWidth, pdfHeight, null, 'FAST');
        }
        
        return doc.output('datauristring', { compress: true });
    } catch (error) {
        console.error('Browser PDF creation error:', error);
        return null;
    }
}

async function createServerPDF(pages) {
    try {
        const response = await fetch('/api/create-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pages })
        });
        
        if (!response.ok) throw new Error('Server PDF creation failed');
        
        const pdfBlob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(pdfBlob);
        });
    } catch (error) {
        console.error('Server PDF creation error:', error);
        return null;
    }
}

async function compressImage(dataUrl, maxWidth = 800, quality = 0.5) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (maxWidth * height) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = dataUrl;
    });
}
