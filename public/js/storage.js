document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('change', function() {
            saveFormData();
            showSaveMessage();
        });
    }

    function saveFormData() {
        if (!form) return;
        const formData = {};
        const formElements = form.elements;

        for (let element of formElements) {
            if (element.name) {
                if (element.type === 'checkbox') {
                    formData[element.name] = element.checked;
                } else if (element.type === 'radio') {
                    if (element.checked) {
                        formData[element.name] = element.value;
                    }
                } else {
                    formData[element.name] = element.value;
                }
            }
        }

        const currentPage = window.location.pathname.split('/').pop();
        let savedData = JSON.parse(localStorage.getItem('formData') || '{}');
        savedData[currentPage] = formData;
        localStorage.setItem('formData', JSON.stringify(savedData));
    }

    function loadSavedData() {
        const savedData = localStorage.getItem('formData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            const currentPage = window.location.pathname.split('/').pop();
            const pageData = parsedData[currentPage];

            if (pageData && form) {
                Object.keys(pageData).forEach(key => {
                    const element = form.elements[key];
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = pageData[key];
                        } else if (element.type === 'radio') {
                            const radio = form.querySelector(`input[name="${key}"][value="${pageData[key]}"]`);
                            if (radio) radio.checked = true;
                        } else {
                            element.value = pageData[key];
                        }
                    }
                });
            }
        }
    }

    function showSaveMessage() {
        const existingMessage = document.querySelector('.save-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = 'save-message';
        message.textContent = 'הנתונים נשמרו';
        message.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            animation: fadeIn 0.3s, fadeOut 0.3s 2s forwards;
        `;

        document.body.appendChild(message);
        setTimeout(() => {
            message.remove();
        }, 2300);
    }

    loadSavedData();
});