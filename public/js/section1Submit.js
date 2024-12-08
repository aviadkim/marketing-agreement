const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwf-7F8NIXbcDGTCKsx_5eCfxv9BTgGkSTYKMfWbCQNm37Rab2HA70gt8MkiXZWd6Ps/exec';

async function submitToGoogleSheets() {
    try {
        const form = document.querySelector('#section1-form');
        if (!form) {
            console.error('Form not found');
            return false;
        }

        // Get form data
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Add section identifier
        data.section = '1';
        data.timestamp = new Date().toISOString();

        // Add screenshot if possible
        try {
            data.formScreenshot = await captureFormScreenshot();
        } catch (err) {
            console.warn('Screenshot capture failed:', err);
        }

        console.log('Sending data to Google Sheets:', data);

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // Store in localStorage
        localStorage.setItem('section1Data', JSON.stringify(data));

        // Log response
        console.log('Google Sheets response:', response);

        if (response.ok) {
            console.log('Data sent successfully');
            return true;
        } else {
            console.error('Failed to send data:', response);
            return false;
        }

    } catch (error) {
        console.error('Submit error:', error);
        return false;
    }
}

// Add this debug function
window.testGoogleConnection = async function() {
    try {
        const testData = {
            test: true,
            timestamp: new Date().toISOString()
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('Test response:', response);
        return response;
    } catch (error) {
        console.error('Test failed:', error);
        return null;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#section1-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const success = await submitToGoogleSheets();
            if (success) {
                window.location.href = '/sections/section2.html';
            }
        });
    }
});
