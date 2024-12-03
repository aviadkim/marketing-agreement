// navigation.js
let currentSection = parseInt(window.location.pathname.match(/section(\d+)/)?.[1] || 1);

function loadSavedData() {
   const savedData = localStorage.getItem(`section${currentSection}Data`);
   if (savedData) {
       try {
           const data = JSON.parse(savedData);
           populateFormFields(data);
       } catch (e) {
           console.error('Error loading saved data:', e);
       }
   }
}

function populateFormFields(data) {
   const form = document.querySelector('form');
   if (!form) return;

   Object.entries(data).forEach(([key, value]) => {
       const field = form.elements[key];
       if (!field) return;

       if (field.type === 'checkbox' || field.type === 'radio') {
           if (Array.isArray(value)) {
               value.forEach(v => {
                   const input = form.querySelector(`input[name="${key}"][value="${v}"]`);
                   if (input) input.checked = true;
               });
           } else {
               const input = form.querySelector(`input[name="${key}"][value="${value}"]`);
               if (input) input.checked = true;
           }
       } else if (field.type === 'textarea') {
           field.value = value;
       } else {
           field.value = value;
       }
   });

   if (data.signature && window.signatureHandler?.signaturePad) {
       window.signatureHandler.signaturePad.fromDataURL(data.signature);
       if (document.getElementById('signatureData')) {
           document.getElementById('signatureData').value = data.signature;
       }
   }
}

function saveFormData() {
   const form = document.querySelector('form');
   if (!form) return;

   const formData = new FormData(form);
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

   const signatureData = document.getElementById('signatureData')?.value;
   if (signatureData) {
       data.signature = signatureData;
       localStorage.setItem('lastSignature', signatureData);
   }

   localStorage.setItem(`section${currentSection}Data`, JSON.stringify(data));
   showMessage('נשמר בהצלחה', 'success');
}

function validateSection3() {
   const form = document.querySelector('form');
   
   const marketExperience = form.querySelector('input[name="marketExperience"]:checked');
   if (!marketExperience) {
       showMessage('יש לבחור רמת ידע וניסיון בשוק ההון', 'error');
       return false;
   }

   const riskTolerance = form.querySelector('input[name="riskTolerance"]:checked');
   if (!riskTolerance) {
       showMessage('יש לבחור רמת סיכון', 'error');
       return false;
   }

   const lossResponse = form.querySelector('input[name="lossResponse"]:checked');
   if (!lossResponse) {
       showMessage('יש לבחור תגובה להפסד', 'error');
       return false;
   }

   const investmentKnowledge = form.querySelector('input[name="investmentKnowledge"]:checked');
   if (!investmentKnowledge) {
       showMessage('יש לבחור לפחות סוג השקעה אחד', 'error');
       return false;
   }

   const signature = document.getElementById('signatureData')?.value;
   if (!signature) {
       showMessage('נדרשת חתימה דיגיטלית', 'error');
       return false;
   }

   return true;
}

function showMessage(message, type = 'success') {
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

function navigateNext() {
   const form = document.querySelector('form');
   if (!form) return;

   let isValid = true;

   if (currentSection === 3) {
       isValid = validateSection3();
   } else {
       isValid = form.checkValidity();
       if (!isValid) form.reportValidity();
   }

   if (isValid) {
       saveFormData();
       window.location.href = `/sections/section${currentSection + 1}.html`;
   }
}

function navigateBack() {
   saveFormData();
   if (currentSection > 1) {
       window.location.href = `/sections/section${currentSection - 1}.html`;
   }
}

async function submitToGoogleSheets() {
   const allData = {};
   
   // Collect data from all sections
   for (let i = 1; i <= 4; i++) {
       const sectionData = localStorage.getItem(`section${i}Data`);
       if (sectionData) {
           Object.assign(allData, JSON.parse(sectionData));
       }
   }

   try {
       const response = await fetch('/api/submit-to-sheets', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify(allData)
       });

       if (!response.ok) throw new Error('שגיאה בשליחת הנתונים');

       // Clear local storage after successful submission
       for (let i = 1; i <= 4; i++) {
           localStorage.removeItem(`section${i}Data`);
       }
       localStorage.removeItem('lastSignature');

       return true;
   } catch (error) {
       console.error('Submission error:', error);
       showMessage('שגיאה בשליחת הטופס', 'error');
       return false;
   }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
   loadSavedData();

   // Setup auto-save
   const form = document.querySelector('form');
   if (form) {
       form.addEventListener('change', saveFormData);
   }

   // Setup navigation buttons
   document.getElementById('btnBack')?.addEventListener('click', navigateBack);
   document.getElementById('saveAndContinue')?.addEventListener('click', navigateNext);
   
   // Setup final submit
   document.getElementById('finalSubmit')?.addEventListener('click', submitToGoogleSheets);

   // Initialize exclusive checkboxes
   document.querySelectorAll('input[data-exclusive="true"]').forEach(exclusive => {
       exclusive.addEventListener('change', function() {
           const name = this.name;
           const otherCheckboxes = document.querySelectorAll(`input[name="${name}"]:not([data-exclusive="true"])`);
           if (this.checked) {
               otherCheckboxes.forEach(cb => {
                   cb.checked = false;
                   cb.disabled = true;
               });
           } else {
               otherCheckboxes.forEach(cb => cb.disabled = false);
           }
       });
   });
});
