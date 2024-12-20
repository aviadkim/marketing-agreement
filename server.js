const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

// Block legacy files and prevent caching
app.use((req, res, next) => {
    // Block old files
    if (req.url.includes('/sections/') || 
        req.url.includes('section1.html') || 
        req.url.includes('section2.html') || 
        req.url.includes('section3.html') || 
        req.url.includes('section4.html') ||
        req.url.includes('navigation.js') ||
        req.url.includes('formCapture.js') ||
        req.url.includes('sectionSubmit.js')) {
        console.log('[SERVER] Blocking legacy file access:', req.url);
        res.set('Clear-Site-Data', '"cache"');
        return res.redirect(301, '/');  // permanent redirect
    }

    // Strong cache prevention
    res.set({
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    next();
});

// Basic middleware setup
app.use(express.json({ limit: "50mb" }));

// Static files with cache control
app.use(express.static("public", {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
        res.set({
            'Cache-Control': 'no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Content-Type-Options': 'nosniff'
        });
    }
}));

// PDF directory setup
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));
const PDF_DIR = path.join(__dirname, 'pdfs');
if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
}

// Main route - always serve the new form
app.get('/', (req, res) => {
    console.log('[SERVER] Serving new form page');
    res.sendFile(path.join(__dirname, 'public', 'form-new.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    console.log('[SERVER] Health check');
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
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
                size: fs.statSync(path.join(PDF_DIR, file)).size,
                created: fs.statSync(path.join(PDF_DIR, file)).birthtime
            }));
        res.json({ success: true, forms });
    } catch (error) {
        console.error("[SERVER ERROR]:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Block unwanted files specifically
app.use('*/sections/*', (req, res) => {
    console.log('[SERVER] Blocking access to old sections folder');
    res.redirect(301, '/');
});

// Final catch-all route - redirect everything else to new form
app.use('*', (req, res) => {
    console.log(`[SERVER] Redirecting unknown request to new form:`, req.url);
    res.redirect(307, '/');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err);
    res.status(500).json({
        success: false,
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`[SERVER] Starting new version with enhanced security`);
    console.log(`[SERVER] Running on port ${PORT}`);
    console.log(`[SERVER] PDF directory: ${PDF_DIR}`);
    console.log(`[SERVER] Cache disabled`);
    console.log('='.repeat(50));
});
