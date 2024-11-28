document.addEventListener('DOMContentLoaded', function() {
    loadFormData();

    function loadFormData() {
        const form = document.querySelector('form');
        if (!form) return;

        const currentFormData = JSON.parse(localStorage.getItem('formData') || '{}');
        const data = currentFormData[form.id];

        if (data) {
            Object.keys(data).forEach(key => {
                const field = form.elements[key];
                if (field) {
                    field.value = data[key];
                }
            });
        }
    }
});
