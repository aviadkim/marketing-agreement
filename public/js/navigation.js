class Navigation {
   constructor() {
       this.currentSection = parseInt(window.location.pathname.match(/section(\d+)/)?.[1] || 1);
       this.init();
   }

   init() {
       this.form = document.querySelector('form');
       this.setupEventListeners();
       this.loadSavedData();
       this.initializeExclusiveCheckboxes();
   }

   setupEventListeners() {
       if (this.form) {
           this.form.addEventListener('change', () => this.handleFormChange());
       }

       const nextButton = document.getElementById('saveAndContinue');
       if (nextButton) {
           nextButton.addEventListener('click', () => this.handleNext());
       }

       const backButton = document.getElementById('btnBack');
       if (backButton) {
           backButton.addEventListener('click', () => this.handleBack());
       }
   }

   handleFormChange() {
       this.saveFormData();
   }

   initializeExclusiveCheckboxes() {
       document.querySelectorAll('input[data-exclusive="true"]').forEach(exclusive => {
           exclusive.addEventListener('change', (e) => this.handleExclusiveCheckbox(e.target));
       });

       document.querySelectorAll('input[type="checkbox"]:not([data-exclusive="true"])').forEach(checkbox => {
           checkbox.addEventListener('change', (e) => this.handleNonExclusiveCheckbox(e.target));
       });
   }

   handleExclusiveCheckbox(checkbox) {
       const name = checkbox.name;
       const otherCheckboxes = document.querySelectorAll(`input[name="${name}"]:not([data-exclusive="true"])`);
       
       if (checkbox.checked) {
           otherCheckboxes.forEach(cb => {
               cb.checked = false;
               cb.disabled = true;
           });
       } else {
           otherCheckboxes.forEach(cb => cb.disabled = false);
       }
   }

   handleNonExclusiveCheckbox(checkbox) {
       if (checkbox.checked) {
           const exclusive = document.querySelector(`input[name="${checkbox.name}"][data-exclusive="true"]`);
           if (exclusive) {
               exclusive.checked = false;
           }
       }
   }

   validateForm() {
       if (!this.form) return false;

       if (this.currentSection === 3) {
           const marketExperience = this.form.querySelector('input[name="marketExperience"]:checked');
           if (!marketExperience) {
               this.showError('יש לבחור רמת ידע וניסיון בשוק ההון');
               return false;
           }

           const riskTolerance = this.form.querySelector('input[name="riskTolerance"]:checked');
           if (!riskTolerance) {
               this.showError('יש לבחור רמת סיכון');
               return false;
           }

           const lossResponse = this.form.querySelector('input[name="lossResponse"]:checked');
           if (!lossResponse) {
               this.showError('יש לבחור תגובה להפסד');
               return false;
           }

           const investmentKnowledge = this.form.querySelector('input[name="investmentKnowledge"]:checked');
           if (!investmentKnowledge) {
               this.showError('יש לבחור לפחות סוג השקעה אחד');
               return false;
           }

           const signature = document.getElementById('signatureData')?.value;
           if (!signature) {
               this.showError('נדרשת חתימה דיגיטלית');
               return false;
           }

           return true;
       }

       // For sections 1, 2, and 4
       return this.form.checkValidity();
   }

   saveFormData() {
       if (!this.form) return;
       
       const formData = new FormData(this.form);
       const data = {};
       
       formData.forEach((value, key) => {
           if (data[key]) {
               if (!Array.isArray(data[key])) {
                   data[key] = [data[key]];
               }
               data[key].push(value);
           } else {
               data[key] = value;
           }
       });

       // Save signature if exists
       const signatureData = document.getElementById('signatureData')?.value;
       if (signatureData) {
           data.signature = signatureData;
           localStorage.setItem('lastSignature', signatureData);
       }

       // Save to section-specific storage
       localStorage.setItem(`section${this.currentSection}Data`, JSON.stringify(data));
       this.showSuccessMessage('הנתונים נשמרו בהצלחה');
   }

   loadSavedData() {
       const savedData = localStorage.getItem(`section${this.currentSection}Data`);
       if (savedData && this.form) {
           try {
               const data = JSON.parse(savedData);
               Object.entries(data).forEach(([key, value]) => {
                   if (Array.isArray(value)) {
                       value.forEach(v => {
                           const input = this.form.querySelector(`input[name="${key}"][value="${v}"]`);
                           if (input) input.checked = true;
                       });
                   } else {
                       const input = this.form.querySelector(`input[name="${key}"][value="${value}"]`);
                       if (input) {
                           if (input.type === 'checkbox' || input.type === 'radio') {
                               input.checked = true;
                           } else {
                               input.value = value;
                           }
                       } else if (key === 'investmentRestrictions') {
                           const textarea = this.form.querySelector(`textarea[name="${key}"]`);
                           if (textarea) textarea.value = value;
                       }
                   }
               });

               // Load signature if exists
               if (data.signature && window.signatureHandler) {
                   window.signatureHandler.signaturePad.fromDataURL(data.signature);
                   document.getElementById('signatureData').value = data.signature;
               }
           } catch (error) {
               console.error('Error loading saved data:', error);
           }
       }
   }

   showError(message) {
       const errorDiv = document.createElement('div');
       errorDiv.className = 'error-message';
       errorDiv.textContent = message;
       errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc3545; color: white; padding: 12px 24px; border-radius: 8px; z-index: 1000; animation: fadeIn 0.3s;';
       document.body.appendChild(errorDiv);
       setTimeout(() => errorDiv.remove(), 3000);
   }

   showSuccessMessage(message) {
       const messageDiv = document.createElement('div');
       messageDiv.className = 'success-message';
       messageDiv.textContent = message;
       messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 12px 24px; border-radius: 8px; z-index: 1000; animation: fadeIn 0.3s;';
       document.body.appendChild(messageDiv);
       setTimeout(() => messageDiv.remove(), 2000);
   }

   handleNext() {
       if (this.validateForm()) {
           this.saveFormData();
           window.location.href = `/sections/section${this.currentSection + 1}.html`;
       }
   }

   handleBack() {
       this.saveFormData();
       window.location.href = `/sections/section${this.currentSection - 1}.html`;
   }
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', () => new Navigation());
