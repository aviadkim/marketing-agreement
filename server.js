const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.static('public'));
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'info@movne.co.il',
        pass: process.env.EMAIL_PASSWORD
    }
});
app.post('/api/send-form', async (req, res) => {
    try {
        const { pdfContent } = req.body;
        await transporter.sendMail({
            from: 'info@movne.co.il',
            to: 'info@movne.co.il',
            subject: 'Form Submission',
            attachments: [{
                filename: 'form.pdf',
                content: pdfContent.split('base64,')[1],
                encoding: 'base64'
            }]
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: error.message });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\Server running on port \\));
