const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "info@movne.co.il",
        pass: "wnxi vwum ugpf sack" // App Password ?????
    }
});

app.post("/api/send-form", async (req, res) => {
    try {
        const { pdfContent } = req.body;
        
        await transporter.sendMail({
            from: "info@movne.co.il",
            to: "info@movne.co.il",
            subject: "???? ??? ?????",
            text: "????? ????? ??????",
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

app.listen(process.env.PORT || 3000);
