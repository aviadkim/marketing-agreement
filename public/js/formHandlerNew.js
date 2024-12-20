class FormHandler {
    constructor() {
        if (window.formHandler) {
            console.log('[DEBUG] Form handler already initialized');
            return;
        }
        window.formHandler = this;
        
        console.log('[DEBUG] Initializing FormHandler');
        this.currentSection = 0;
        this.formData = {};
        this.sections = document.querySelectorAll('.form-section');
        
        // הסתרת כל הסקשנים בהתחלה
        this.sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // הצגת סקשן ראשון
        if (this.sections[0]) {
            this.sections[0].style.display = 'block';
            this.sections[0].classList.add('active');
        }

        this.initializeEventListeners();
        this.initializeSignaturePad();
        this.loadSavedData();
        this.updateProgressBar();
        this.updateNavigationButtons();
    }

    initializeEventListeners() {
        // ניווט
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextSection());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevSection());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submitForm());

        // בדיקת לוגים
        document.getElementById('checkLogsBtn')?.addEventListener('click', () => this.checkLogs());

        // שמירה אוטומטית
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.autoSave());
        });
    }

    checkLogs() {
        console.log('='.repeat(50));
        console.log('[DEBUG] Form Status Check');
        console.log('-'.repeat(50));
        console.log('Current Section:', this.currentSection);
        console.log('Form Data:', this.formData);
        console.log('Firebase Connection:', window.db ? 'Connected' : 'Not Connected');
        console.log('Signature Status:', this.signaturePad ? 
            (!this.signaturePad.isEmpty() ? 'Signed' : 'Empty') : 
            'Not Initialized');
        console.log('='.repeat(50));

        // בדיקת חיבור לפיירבייס
        if (window.db) {
            window.db.collection('test').add({
                test: 'Connection Test',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
           .then(() => console.log('[DEBUG] Firebase Write Test: Success'))
           .catch(err => console.error('[ERROR] Firebase Write Test Failed:', err));
       }
   }

   initializeSignaturePad() {
       const canvas = document.getElementById('signatureCanvas');
       if (!canvas) {
           console.warn('[WARN] Signature canvas not found');
           return;
       }

       this.signaturePad = new SignaturePad(canvas);
       
       document.querySelector('[data-clear-signature]')?.addEventListener('click', () => {
           this.signaturePad.clear();
           console.log('[DEBUG] Signature cleared');
       });

       document.querySelector('[data-copy-signature]')?.addEventListener('click', () => {
           const savedSignature = localStorage.getItem('savedSignature');
           if (savedSignature) {
               this.signaturePad.fromDataURL(savedSignature);
               console.log('[DEBUG] Signature loaded from storage');
           }
       });

       document.querySelector('[data-save-signature]')?.addEventListener('click', () => {
           if (!this.signaturePad.isEmpty()) {
               const signatureData = this.signaturePad.toDataURL();
               localStorage.setItem('savedSignature', signatureData);
               this.showMessage('החתימה נשמרה', 'success');
               console.log('[DEBUG] Signature saved to storage');
           }
       });
   }

   updateProgressBar() {
       const steps = document.querySelectorAll('.step');
       steps.forEach((step, index) => {
           if (index <= this.currentSection) {
               step.classList.add('active');
           } else {
               step.classList.remove('active');
           }
       });
   }

   nextSection() {
       console.log('[DEBUG] Moving to next section');
       if (this.currentSection < this.sections.length - 1) {
           // הסתר נוכחי
           this.sections[this.currentSection].style.display = 'none';
           this.sections[this.currentSection].classList.remove('active');
           
           // הצג הבא
           this.currentSection++;
           this.sections[this.currentSection].style.display = 'block';
           this.sections[this.currentSection].classList.add('active');
           
           this.updateProgressBar();
           this.updateNavigationButtons();
           window.scrollTo(0, 0);
       }
   }
