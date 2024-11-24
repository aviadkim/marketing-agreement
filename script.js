document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const currentDate = new Date();
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('he-IL');
    document.getElementById('signatureDate').value = currentDate.toLocaleDateString('he-IL');

    // Form handling
    const form = document.getElementById('marketingAgreement');
    
    // Save form data as user types
    form.addEventListener('input', function(e) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        localStorage.setItem('marketingAgreement', JSON.stringify(data));
    });

    // Load saved form data if exists
    const savedData = localStorage.getItem('marketingAgreement');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'radio') {
                    form.querySelector(`[name="${key}"][value="${data[key]}"]`).checked = true;
                } else {
                    input.value = data[key];
                }
            }
        });
    }

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch('https://your-api-endpoint.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    submissionDate: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert('ההסכם נשלח בהצלחה');
                localStorage.removeItem('marketingAgreement');
                // Optional: send email to aviad@movne.co.il
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: 'aviad@movne.co.il',
                        subject: 'הסכם שיווק חדש',
                        data: data
                    })
                });
            } else {
                throw new Error('Failed to submit form');
            }
        } catch (error) {
            alert('אירעה שגיאה בשליחת הטופס');
            console.error('Form submission error:', error);
        }
    });
});