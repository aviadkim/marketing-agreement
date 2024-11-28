// accordion.js
document.addEventListener('DOMContentLoaded', function() {
    // בדיקה אם כל תיבות הסימון בהצהרות מסומנות
    function checkAllDeclarations() {
        const checkboxes = document.querySelectorAll('.accordion-content input[type="checkbox"]');
        const submitButton = document.getElementById('finalSubmit');
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        submitButton.disabled = !allChecked;
    }

    // מאזין לכל תיבות הסימון
    document.querySelectorAll('.accordion-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', checkAllDeclarations);
    });

    // פתיחה וסגירה של האקורדיון
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon');
            const isOpen = content.style.maxHeight;

            // סגירת כל החלקים האחרים
            document.querySelectorAll('.accordion-content').forEach(item => {
                item.style.maxHeight = null;
                item.previousElementSibling.querySelector('.accordion-icon').textContent = '▼';
            });

            // פתיחת/סגירת החלק הנוכחי
            if (!isOpen) {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.textContent = '▲';
            }
        });
    });

    // פתיחת החלק הראשון בטעינה
    const firstAccordion = document.querySelector('.accordion-header');
    if (firstAccordion) {
        firstAccordion.click();
    }
});