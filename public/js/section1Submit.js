async function submitSection1() {
    try {
        console.log('Starting section 1 submission...');
        
        const form = document.getElementById('section1-form');
        if (!form.checkValidity()) {
            console.log('Form validation failed');
            form.reportValidity();
            return false;
        }

        const submitButton = document.getElementById('saveAndContinue');
        submitButton.disabled = true;
        console.log('Disabled submit button');

        showMessage('מעבד את הטופס...', 'info');

        // Capture form data
        const formData = new FormData(form);
        console.log('Form data collected:', {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone')
        });

        // Capture screenshot
        console.log('Starting screenshot capture...');
        const screenshot = await captureFormScreenshot();
        console.log('Screenshot captured:', screenshot ? 'Success' : 'Failed');

        const processedData = {
            section: '1',
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            idNumber: formData.get('idNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            formScreenshot: screenshot,
            timestamp: new Date().toISOString()
        };

        console.log('Sending data to Google Sheets:', {
            ...processedData,
            formScreenshot: '[SCREENSHOT DATA HIDDEN]'
        });
        console.log('Using URL:', GOOGLE_SCRIPT_URL);

        // Submit to Google Sheets
        showMessage('שולח את הטופס...', 'info');
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData)
        });

        console.log('Response received:', response);

        // Store for later combination
        localStorage.setItem('section1Data', JSON.stringify({
            ...processedData,
            formScreenshot: '[STORED SEPARATELY]'
        }));
        console.log('Data stored in localStorage');

        showMessage('הטופס נשלח בהצלחה', 'success');
        console.log('Navigating to section 2...');

        setTimeout(() => {
            window.location.href = '/sections/section2.html';
        }, 1000);

        return true;
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        
        const submitButton = document.getElementById('saveAndContinue');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<span class="button-text">המשך לשלב הבא</span>';
        }
        return false;
    }
}
