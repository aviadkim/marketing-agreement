const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Email configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'info@movne.co.il',
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post('/api/generate-pdf', (req, res) => {
    const { htmlContent } = req.body;
    const doc = new PDFDocument();
    let buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        let pdfData = Buffer.concat(buffers).toString('base64');
        res.send(pdfData);
    });

    doc.text(htmlContent);
    doc.end();
});

app.post('/api/send-email', async (req, res) => {
    const { pdfBase64, ...formData } = req.body;

    const mailOptions = {
        from: 'info@movne.co.il',
        to: 'info@movne.co.il',
        subject: 'Section 1 Submission',
        text: 'Please find the attached PDF for Section 1 submission.',
        attachments: [
            {
                filename: 'section1.pdf',
                content: pdfBase64,
                encoding: 'base64'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
