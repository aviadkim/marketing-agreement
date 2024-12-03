const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2Cu2YDQwHz5acvMFx7GzN9ht2BiuQkRI459f7_75y96Hh2BAUMimYl3e2XYEr_uhh/exec';

async function processFormData() {
    const allData = {};
    for (let i = 1; i <= 4; i++) {
        const sectionData = localStorage.getItem(`section${i}Data`);
        if (sectionData) {
            Object.assign(allData, JSON.parse(sectionData));
        }
    }
    return allData;
}

async function submitFormToGoogleSheets() {
    try {
        const formData = await processFormData();
        
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'שגיאה בשליחת הנתונים');
        }

        // Clear local storage
        for (let i = 1; i <= 4; i++) {
            localStorage.removeItem(`section${i}Data`);
        }
        localStorage.removeItem('lastSignature');
        
        window.location.href = '/sections/preview.html';
        return true;

    } catch (error) {
        console.error('Submission error:', error);
        showMessage(error.message || 'שגיאה בשליחת הטופס', 'error');
        return false;
    }
}

function showMessage(message, type = 'error') {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = message;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        color: white;
        background: ${type === 'success' ? '#4CAF50' : '#dc3545'};
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}
