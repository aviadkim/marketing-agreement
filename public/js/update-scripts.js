const fs = require('fs');
const path = require('path');

const scriptsBlock = `
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.min.js"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    <script type="module" src="/js/formHandler.js"></script>
    <script defer src="/js/validation.js"></script>
    <script defer src="/js/storage.js"></script>
    <script type="module" src="/js/navigation.js"></script>
</body>
</html>`;

const sectionsDir = path.join(__dirname, '..', 'sections');

try {
    const files = fs.readdirSync(sectionsDir);
    console.log('Found files:', files);
    
    files.forEach(file => {
        if (file.match(/section[1-4]\.html/)) {
            const filePath = path.join(sectionsDir, file);
            console.log('Processing:', filePath);
            
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(/<!-- Scripts -->[\s\S]*?<\/html>/, scriptsBlock);
            fs.writeFileSync(filePath, content);
            
            console.log('Updated:', file);
        }
    });
    
    console.log('All files updated successfully');
} catch (error) {
    console.error('Error:', error);
}
