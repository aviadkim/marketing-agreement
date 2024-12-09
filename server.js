const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

// ????? ?????? ?? ?? ??????
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// ?????? ????? ????
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post("/api/submit", async (req, res) => {
    try {
        const data = req.body;
        
        // ????? ??????
        if (data.formPdf) {
            const pdfPath = path.join(uploadsDir, `form_${data.section}_${Date.now()}.pdf`);
            fs.writeFileSync(pdfPath, data.formPdf.split(",")[1], "base64");
        }
        
        // ????? ????? ????
        // ???? ????? ??? ?????? ????? ????
        
        // ????? ????
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `???? ??? - ???? ${data.section}`,
            html: `<div dir="rtl">????? ???? ??? ????? ${data.section}</div>`
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
