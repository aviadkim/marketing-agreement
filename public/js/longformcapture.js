// longFormCapture.js
class LongFormCapture {
    constructor() {
        this.init();
        console.log('[LongForm] Handler initialized');
    }

    async init() {
        try {
            this.db = window.db;
            this.storage = window.storage;
            console.log('[LongForm] Firebase connection established');
            await this.testConnection();
        } catch (error) {
            console.error('[LongForm] Firebase connection failed:', error);
        }
    }

    async testConnection() {
        try {
            await this.db.collection('test').add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                test: 'LongFormCapture connection test'
            });
            console.log('[LongForm] Connection test successful');
        } catch (error) {
            console.error('[LongForm] Connection test failed:', error);
        }
    }

    async createTempContainer() {
        const container = document.createElement('div');
        container.className = 'full-form-container';
        container.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: 864px;
            background: white;
            z-index: -1;
            padding: 20px;
            margin: 0;
            box-sizing: border-box;
        `;
        document.body.appendChild(container);
        return container;
    }

    async loadSection(sectionNum) {
        // קבלת הנתונים מהלוקל סטורג'
        const key = sectionNum === 1 ? 'formData' : `section${sectionNum}Data`;
        const data = localStorage.getItem(key);
        console.log(`[LongForm] Loading section ${sectionNum} data:`, data);
        
        if (!data) {
            console.warn(`[LongForm] No data found for section ${sectionNum}`);
            return null;
        }

        try {
            // יצירת הסקשן
            const section = document.createElement('div');
            section.className = `form-section section-${sectionNum}`;
            section.innerHTML = await this.getSectionTemplate(sectionNum);
            
            // מילוי הנתונים השמורים
            const formData = JSON.parse(data);
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'signature') return; // דילוג על חתימות
                
                const input = section.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = value === 'on' || value === true;
                    } else {
                        input.value = value;
                    }
                }
            });

            // הוספת מספר סקשן
            section.dataset.section = sectionNum;
            
            return section;
        } catch (error) {
            console.error(`[LongForm] Failed to load section ${sectionNum}:`, error);
            return null;
        }
    }

    async getSectionTemplate(sectionNum) {
        try {
            const response = await fetch(`/sections/section${sectionNum}.html`);
            if (!response.ok) throw new Error(`Failed to fetch section ${sectionNum}`);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const content = doc.querySelector('.form-content');
            if (!content) throw new Error(`Form content not found in section ${sectionNum}`);
            
            return content.innerHTML;
        } catch (error) {
            console.error(`[LongForm] Template loading failed for section ${sectionNum}:`, error);
            throw error;
        }
    }

    async captureFullForm() {
        console.log('[LongForm] Starting full form capture');
        const container = await this.createTempContainer();

        try {
            // טעינת כל הסקשנים
            for (let i = 1; i <= 4; i++) {
                const section = await this.loadSection(i);
                if (section) {
                    container.appendChild(section);
                    console.log(`[LongForm] Added section ${i} to container`);
                }
            }

            // חכה שהכל יטען
            await new Promise(resolve => setTimeout(resolve, 1000));

            // צילום
            console.log('[LongForm] Starting capture, container height:', container.scrollHeight);
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: true,
                height: container.scrollHeight,
                windowHeight: container.scrollHeight
            });

            console.log('[LongForm] Canvas created, size:', canvas.width, 'x', canvas.height);

            // יצירת PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

            // שמירה בפיירבייס
            const blob = pdf.output('blob');
            console.log('[LongForm] PDF created, size:', blob.size);

            const fileName = `forms/complete_${Date.now()}.pdf`;
            const storageRef = this.storage.ref().child(fileName);
            
            await storageRef.put(blob, {
                contentType: 'application/pdf',
                customMetadata: {
                    type: 'complete_form',
                    timestamp: new Date().toISOString()
                }
            });

            const url = await storageRef.getDownloadURL();
            console.log('[LongForm] Form saved to Firebase:', url);

            return { url, fileName, size: blob.size };

        } catch (error) {
            console.error('[LongForm] Capture failed:', error);
            throw error;
        } finally {
            document.body.removeChild(container);
        }
    }
}

// יצירת instance יחיד
window.longFormCapture = new LongFormCapture();

// חשיפת פונקציות לבדיקות
window.testLongForm = async () => {
    try {
        const result = await window.longFormCapture.captureFullForm();
        console.log('[TEST] Capture test result:', result);
        return result;
    } catch (error) {
        console.error('[TEST] Capture test failed:', error);
        throw error;
    }
};