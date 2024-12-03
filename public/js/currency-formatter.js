function initializeCurrencyFormatting() {
    const currencyInputs = document.querySelectorAll('input[data-type="currency"]');
    
    currencyInputs.forEach(input => {
        // Format on blur
        input.addEventListener('blur', function(e) {
            let value = this.value.replace(/[^\d]/g, '');
            
            if (value !== '') {
                value = parseInt(value);
                this.value = value.toLocaleString('he-IL');
            }
        });

        // On focus, remove formatting
        input.addEventListener('focus', function(e) {
            this.value = this.value.replace(/,/g, '');
        });

        // While typing, only allow numbers
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^\d,]/g, '');
        });
    });
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', initializeCurrencyFormatting);

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeCurrencyFormatting };
}
