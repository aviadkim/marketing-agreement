const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

// יצירת תיקיית PDF אם לא קיימת
const PDF_DIR = path.join(__dirname, 'pdfs');
if (!fs.existsSync(PDF_DIR)){
    fs.mkdirSync(PDF_DIR);
}

// הגדרת המייל
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "info@movne.co.il",
        pass: "wnxi vwum ugpf sack"
    }
});

// נתיב חדש לשמירת PDF
app.post("/api/save-pdf", async (req, res) => {
    try {
        const { pdfContent, formName } = req.body;
        const fileName = `form_${Date.now()}.pdf`;
        const pdfBuffer = Buffer.from(pdfContent.split(',')[1], 'base64');
        
        // שמירת הקובץ בתיקיית pdfs
        const filePath = path.join(PDF_DIR, fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        // שליחת מייל עם הPDF
        await transporter.sendMail({
            from: "info@movne.co.il",
            to: "info@movne.co.il",
            subject: "טופס חדש נשלח",
            text: "מצורף טופס חדש",
            attachments: [{
                filename: fileName,
                path: filePath
            }]
        });

        res.json({ 
            success: true, 
            fileName: fileName,
            filePath: filePath
        });
    } catch (error) {
        console.error("Error saving PDF:", error);
        res.status(500).json({ error: error.message });
    }
});

// אנדפוינט לשליחת טופס במייל
app.post("/api/send-form", async (req, res) => {
    try {
        const { pdfContent, email, formData } = req.body;

        await transporter.sendMail({
            from: "info@movne.co.il",
            to: email,
            subject: "טופס שיווק חדש",
            text: "מצורף טופס להסכם",
            attachments: [{
                filename: "form.pdf",
                content: pdfContent.split("base64,")[1],
                encoding: "base64"
            }]
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: error.message });
    }
});

// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`PDF directory: ${PDF_DIR}`);
});