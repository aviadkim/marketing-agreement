// public/js/pdfViewer.js
async function loadFormData(uniqueId) {
    try {
        // Extract form data from uniqueId (timestamp_idNumber)
        const [timestamp, idNumber] = uniqueId.split('_');
        
        // Get all sections data
        const formData = {};
        for (let i = 1; i <= 4; i++) {
            const sectionData = localStorage.getItem(`section${i}Data`);
            if (sectionData) {
                Object.assign(formData, JSON.parse(sectionData));
            }
        }

        return formData;
    } catch (error) {
        console.error('Error loading form data:', error);
        return null;
    }
}

// Initialize viewer
document.addEventListener('DOMContentLoaded', async () => {
    // Get uniqueId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const uniqueId = urlParams.get('id');
    
    if (uniqueId) {
        const formData = await loadFormData(uniqueId);
        if (formData) {
            // Populate form data in the viewer
            Object.entries(formData).forEach(([key, value]) => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value === true || value === 'on';
                    } else {
                        element.textContent = value;
                    }
                }
            });
        }
    }
});
