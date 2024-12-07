const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKIS5nbJFMOCgLNZEsIFm0eWuGqkWb8v-1CqjAqHiM8iZ3VTrnKakaOg3PPjCiwOAM/exec';

async function submitSection1() {
    try {
        const form = document.getElementById('section1-form');
        const formData = new FormData(form);
        
        // Capture screenshot
        const screenshot = await captureFormScreenshot();
        
        const data = {
            section: '1',
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            formScreenshot: screenshot,
            timestamp: new Date().toISOString(),
            downloadUrl: `${window.location.origin}/form/section1_${Date.now()}`
        };

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // Store for later combination
        localStorage.setItem('section1Data', JSON.stringify(data));
        
        // Navigate to section 2
        window.location.href = '/sections/section2.html';

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

document.getElementById('saveAndContinue').addEventListener('click', submitSection1);
