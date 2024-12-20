class FormHandler {
    constructor() {
        if (window.formHandler) {
            console.log('[DEBUG] Form handler already exists');
            return window.formHandler;
        }
        
        console.log('[DEBUG] Initializing new FormHandler');
        window.formHandler = this;

        // Initialize state
        this.currentSection = 0;
        this.formData = {};
        this.sections = document.querySelectorAll('.form-section');
        this.hasChanges = false;

        // Check if sections exist
        if (!this.sections || this.sections.length === 0) {
            console.error('[ERROR] No form sections found!');
            this.showDebugMessage();
            return;
        }

        console.log(`[DEBUG] Found ${this.sections.length} sections`);

        this.initializeSections();
        this.initializeEventListeners();
        this.initializeSignaturePad();
        this.loadSavedData();

        return this;
    }

    showDebugMessage() {
        alert(`
            בעיית תצוגה בטופס:
            - נמצאו ${this.sections.length} סקשנים
            - בדוק בבקשה את הקונסול
            - וודא שכל הקבצים נטענו כראוי
        `);
    }

    initializeSections() {
        console.log('[DEBUG] Initializing sections');

        // Force sections to be visible during initialization
        this.sections.forEach(section => {
            section.style.position = 'relative';
            section.style.display = 'none';
            section.style.opacity = '1';
            section.style.visibility = 'visible';
            section.classList.remove('active');
        });

        // Show first section
        if (this.sections[0]) {
            console.log('[DEBUG] Displaying first section');
            this.sections[0].style.display = 'block';
            this.sections[0].classList.add('active');
        }

        // Update UI
        this.updateProgressBar();
        this.updateNavigationButtons();

        // Log sections state
        this.sections.forEach((section, index) => {
            console.log(`[DEBUG] Section ${index + 1} (${section.id}):`, {
                display: section.style.display,
                visible: section.style.visibility,
                opacity: section.style.opacity,
                position: section.style.position
            });
        });
    }

    initializeEventListeners() {
        console.log('[DEBUG] Setting up event listeners');

        // Navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (!prevBtn || !nextBtn || !submitBtn) {
            console.error('[ERROR] Navigation buttons not found!');
            return;
        }

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[DEBUG] Previous button clicked');
            this.prevSection();
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[DEBUG] Next button clicked');
            this.nextSection();
        });

        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[DEBUG] Submit button clicked');
            this.submitForm();
        });

        // Form changes
        const form = document.getElementById('mainForm');
        if (form) {
            form.addEventListener('input', () => {
                this.hasChanges = true;
                this.autoSave();
            });
        }

        // Debug button
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'בדוק מצב טופס';
        debugBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            padding: 8px 16px;
            background: #2d3748;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        debugBtn.onclick = () => this.debugForm();
        document.body.appendChild(debugBtn);
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

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.style.display = this.currentSection === 0 ? 'none' : 'block';
        }
        if (nextBtn) {
            nextBtn.style.display = this.currentSection === this.sections.length - 1 ? 'none' : 'block';
        }
        if (submitBtn) {
            submitBtn.style.display = this.currentSection === this.sections.length - 1 ? 'block' : 'none';
        }
    }

    nextSection() {
        if (this.currentSection >= this.sections.length - 1) return;

        this.sections[this.currentSection].style.display = 'none';
        this.sections[this.currentSection].classList.remove('active');
        
        this.currentSection++;
        
        this.sections[this.currentSection].style.display = 'block';
        this.sections[this.currentSection].classList.add('active');

        this.updateProgressBar();
        this.updateNavigationButtons();
        window.scrollTo(0, 0);

        console.log(`[DEBUG] Moved to section ${this.currentSection + 1}`);
    }

    prevSection() {
        if (this.currentSection <= 0) return;

        this.sections[this.currentSection].style.display = 'none';
        this.sections[this.currentSection].classList.remove('active');
        
        this.currentSection--;
        
        this.sections[this.currentSection].style.display = 'block';
        this.sections[this.currentSection].classList.add('active');

        this.updateProgressBar();
        this.updateNavigationButtons();
        window.scrollTo(0, 0);

        console.log(`[DEBUG] Moved back to section ${this.currentSection + 1}`);
    }

    debugForm() {
        console.log('='.repeat(50));
        console.log('Form Debug Information');
        console.log('='.repeat(50));
        console.log('Current Section:', this.currentSection + 1);
        console.log('Total Sections:', this.sections.length);
        
        this.sections.forEach((section, index) => {
            console.log(`\nSection ${index + 1} (${section.id}):`);
            console.log('Display:', window.getComputedStyle(section).display);
            console.log('Visibility:', window.getComputedStyle(section).visibility);
            console.log('Opacity:', window.getComputedStyle(section).opacity);
            console.log('Position:', window.getComputedStyle(section).position);
            console.log('Content (first 100 chars):', section.innerHTML.substring(0, 100));
        });

        alert('Debug information has been logged to console');
    }
}

// Initialize handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOM loaded, initializing form handler');
    window.formHandler = new FormHandler();
});
