const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Email configuration
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "info@movne.co.il",
        pass: process.env.EMAIL_PASSWORD // ?? ?????? ?-Railway
    }
});

// Test email endpoint
app.post("/api/test-email", async (req, res) => {
    try {
        const { to, subject, pdfBase64 } = req.body;
        await transporter.sendMail({
            from: "info@movne.co.il",
            to: to,
            subject: subject,
            attachments: [{
                filename: "section1.pdf",
                content: pdfBase64.split("base64,")[1],
                encoding: "base64"
            }]
        });
        res.json({ success: true });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Handle all routes for SPA
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
