const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

// Force redirect from sections before any static file serving
app.use((req, res, next) => {
    if (req.url.startsWith('/sections/') || req.url === '/sections') {
        console.log('[SERVER] Intercepting sections request:', req.url);
        return res.redirect('/');
    }
    next();
});

// Middleware setup
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public", {
    // מונע גישה לתיקיית sections
    setHeaders: (res, path) => {
        if (path.includes('/sections/')) {
            return res.redirect('/');
        }
    }
}));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Ensure PDF directory exists
const PDF_DIR = path.join(__dirname, 'pdfs');
if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
}

// Aggressive cache control
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Main route - serve new form
app.get('/', (req, res) => {
    console.log('[SERVER] Serving new form page');
    res.sendFile(path.join(__dirname, 'public', 'form-new.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    console.log('[SERVER] Health check');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// PDF save endpoint
app.post("/api/save-pdf", async (req, res) => {
    try {
        console.log("[SERVER] Received PDF save request");
        const { pdfContent, formData } = req.body;
        
        if (!pdfContent) {
            throw new Error("Missing PDF content");
        }

        const timestamp = new Date().getTime();
        const fileName = `form_${formData.idNumber || timestamp}.pdf`;
        const filePath = path.join(PDF_DIR, fileName);

        const base64Data = pdfContent.replace(/^data:application\/pdf;base64,/, "");
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

        const stats = fs.statSync(filePath);
        console.log(`[SERVER] PDF saved: ${filePath} (${stats.size} bytes)`);
        
        if (stats.size === 0) {
            throw new Error("Created PDF file is empty");
        }

        res.json({
            success: true,
            fileName,
            fileUrl: `/pdfs/${fileName}`,
            fileSize: stats.size
        });
    } catch (error) {
        console.error("[SERVER ERROR]:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// Get forms list endpoint
app.get("/api/forms", (req, res) => {
    try {
        const files = fs.readdirSync(PDF_DIR);
        const forms = files
            .filter(file => file.endsWith('.pdf'))
            .map(file => ({
                name: file,
                url: `/pdfs/${file}`,
                size: fs.statSync(path.join(PDF_DIR, file)).size
            }));
        res.json({ success: true, forms });
    } catch (error) {
        console.error("[SERVER ERROR]:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Catch-all route - redirect everything else to new form
app.use((req, res) => {
    console.log(`[SERVER] Redirecting unhandled request: ${req.url}`);
    res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`[SERVER] Starting new version with sections redirect`);
    console.log(`[SERVER] Running on port ${PORT}`);
    console.log(`[SERVER] PDF directory: ${PDF_DIR}`);
    console.log(`[SERVER] Cache disabled`);
    console.log('='.repeat(50));
});
