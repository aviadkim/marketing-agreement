const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware setup
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Ensure PDF directory exists
const PDF_DIR = path.join(__dirname, 'pdfs');
if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
}

// PDF save endpoint
app.post("/api/save-pdf", async (req, res) => {
    try {
        console.log("[SERVER] Received PDF save request");
        const { pdfContent, formData } = req.body;

        if (!pdfContent) {
            throw new Error("Missing PDF content");
        }

        // Create unique filename
        const timestamp = new Date().getTime();
        const fileName = `form_${formData.idNumber || timestamp}.pdf`;
        const filePath = path.join(PDF_DIR, fileName);

        // Extract and save PDF content
        const base64Data = pdfContent.replace(/^data:application\/pdf;base64,/, "");
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

        // Verify file was created successfully
        const stats = fs.statSync(filePath);
        console.log(`[SERVER] PDF saved: ${filePath} (${stats.size} bytes)`);

        if (stats.size === 0) {
            throw new Error("Created PDF file is empty");
        }

        // Return success response
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[SERVER] Running on port ${PORT}`);
    console.log(`[SERVER] PDF directory: ${PDF_DIR}`);
});