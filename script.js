document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const form = document.getElementById('marketingAgreement');
    const signaturePad = new SignaturePad(document.querySelector('#signaturePad canvas'));
    let savedData = {};

    // Set current date
    function setCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDay').textContent = now.getDate();
        document.getElementById('currentMonth').textContent = now.toLocaleString('he-IL', { month: 'long' });
        document.getElementById('currentYear').textContent = now.getFullYear();
        document.getElementById('signatureDate').textContent = now.toLocaleDateString('he-IL', options);
    }
    setCurrentDate();

    // Auto-save functionality
    function autoSave() {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Add signature if exists
        if (!signaturePad.isEmpty()) {
            data.signature = signaturePad.toDataURL();
        }

        localStorage.setItem('marketingAgreement', JSON.stringify(data));
        showSaveMessage();
    }

    // Show save message
    function showSaveMessage() {
        const saveMsg = document.createElement('div');
        saveMsg.className = 'save-message';
        saveMsg.textContent = 'הטופס נשמר אוטומטית';
        document.body.appendChild(saveMsg);
        setTimeout(() => saveMsg.remove(), 2000);
    }

    // Load saved data
    function loadSavedData() {
        const saved = localStorage.getItem('marketingAgreement');
        if (saved) {
            savedData = JSON.parse(saved);
            Object.entries(savedData).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = value === 'true';
                    } else if (input.type === 'radio') {
                        const radio = form.querySelector(`[name="${key}"][value="${value}"]`);
                        if (radio) radio.checked = true;
                    } else {
                        input.value = value;
                    }
                }
            });

            // Load signature if exists
            if (savedData.signature) {
                signaturePad.fromDataURL(savedData.signature);
            }
        }
    }

    // Handle signature type change
    document.getElementById('signatureType').addEventListener('change', function(e) {
        const methods = ['drawSignature', 'uploadSignature', 'typeSignature'];
        methods.forEach(method => {
            document.getElementById(method).style.display = 
                method === e.target.value ? 'block' : 'none';
        });
    });

    // Clear signature
    document.getElementById('clearSignature').addEventListener('click', function() {
        signaturePad.clear();
    });

    // Handle file upload
    document.getElementById('signatureFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'uploaded-signature';
                const preview = document.getElementById('signaturePreview');
                preview.innerHTML = '';
                preview.appendChild(img);
                savedData.signature = event.target.result;
                autoSave();
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle typed signature
    document.getElementById('typedName').addEventListener('input', function(e) {
        const preview = document.querySelector('#typeSignature .signature-preview');
        preview.style.fontFamily = 'Dancing Script, cursive';
        preview.style.fontSize = '24px';
        preview.textContent = e.target.value;
        savedData.signature = e.target.value;
        autoSave();
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            alert('נא למלא את כל השדות החובה');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Add signature based on selected method
        const signatureType = document.getElementById('signatureType').value;
        if (signatureType === 'draw') {
            data.signature = signaturePad.toDataURL();
        } else if (signatureType === 'upload') {
            data.signature = savedData.signature;
        } else {
            data.signature = document.getElementById('typedName').value;
        }

        try {
            // Send to server
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Send emails
                await sendEmails(data);
                
                // Clear saved data
                localStorage.removeItem('marketingAgreement');
                
                // Show success message
                showSuccess();
            } else {
                throw new Error('שגיאה בשליחת הטופס');
            }
        } catch (error) {
            alert('אירעה שגיאה בשליחת הטופס: ' + error.message);
        }
    });

    // Send emails function
    async function sendEmails(data) {
        // Send to Aviad
        await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: 'aviad@movne.co.il',
                subject: 'הסכם שיווק חדש התקבל',
                data: data
            })
        });

        // Send copy to client
        await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: data.email,
                subject: 'העתק הסכם שיווק - מובנה גלובל',
                data: data,
                isClientCopy: true
            })
        });
    }

    // Form validation
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (document.getElementById('signatureType').value === 'draw' && 
            signaturePad.isEmpty()) {
            isValid = false;
            alert('נא לחתום על הטופס');
        }

        return isValid;
    }

    // Show success message
    function showSuccess() {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `
            <h3>הטופס נשלח בהצלחה!</h3>
            <p>עותק של הטופס נשלח לכתובת המייל שלך</p>
            <p>נציג יצור איתך קשר בקרוב</p>
        `;
        form.appendChild(successMsg);
        form.reset();
        signaturePad.clear();
        window.scrollTo({ top: successMsg.offsetTop, behavior: 'smooth' });
    }

    // Initialize
    loadSavedData();
    form.addEventListener('input', autoSave);
});