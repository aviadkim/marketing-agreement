async function captureFormAsImage() {
    try {
        const formElement = document.querySelector('.form-content');
        if (!formElement) return null;
        
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        
        return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
        console.error('Error capturing form:', error);
        return null;
    }
}

export { captureFormAsImage };
