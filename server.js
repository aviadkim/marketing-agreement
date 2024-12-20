const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

// Middleware to block old files and set correct MIME types
app.use((req, res, next) => {
    // Block old files
    const blockedFiles = [
        'navigation.js',
        'formCapture.js',
        'storage.js',
        'section1Submit.js',
        'section2Submit.js',
        'section3Submit.js',
        'section4Submit.js'
    ];

    if (req.url.includes('/sections/') || 
        blockedFiles.some(file => req.url.includes(file))) {
        console.log('[SERVER] Blocking legacy file:', req.url);
        return res.redirect(301, '/');
    }

    // Set correct MIME types
    if (req.url.endsWith('.js')) {
        res.type('application/javascript');
    } else if (req.url.endsWith('.css')) {
        res.type('text/css');
    }

    // Security headers
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    next();
});

// Basic middleware setup
app.use(express.json({ limit: "50mb" }));

// PDF directory setup
const PDF_DIR = path.join(__dirname, 'pdfs');
if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
}

// Serve static files with cache control
app.use(express.static("public", {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
        res.set({
            'Cache-Control': 'no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
    }
}));

app.use('/pdfs', express.static(PDF_DIR));

// Main routes
app.get('/', (req, res) => {
    console.log('[SERVER] Serving main form');
    res.sendFile(path.join(__dirname, 'public', 'form-new.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
    });
});

// PDF save endpoint
app.post("/api/save-pdf", async (req, res) => {
    try {
        const { pdfContent, formData } = req.body;
        
        if (!pdfContent) {
            throw new Error("Missing PDF content");
        }

        const fileName = `form_${Date.now()}_${formData.idNumber || 'unknown'}.pdf`;
        const filePath = path.join(PDF_DIR, fileName);
        
        const base64Data = pdfContent.replace(/^data:application\/pdf;base64,/, "");
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        
        res.json({
            success: true,
            fileName,
            fileUrl: `/pdfs/${fileName}`
        });
    } catch (error) {
        console.error("[SERVER ERROR]:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

// Final catch-all route
app.use('*', (req, res) => {
    console.log('[SERVER] Redirecting unknown request:', req.url);
    res.redirect(301, '/');
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
