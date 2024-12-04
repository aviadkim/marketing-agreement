require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const app = express();

// Environment variable checks
if (!process.env.GOOGLE_PRIVATE_KEY) {
    console.error('GOOGLE_PRIVATE_KEY is missing from environment variables');
    process.exit(1);
}

if (!process.env.GOOGLE_SPREADSHEET_ID) {
    console.error('GOOGLE_SPREADSHEET_ID is missing from environment variables');
    process.exit(1);
}

if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.error('GOOGLE_SERVICE_ACCOUNT_EMAIL is missing from environment variables');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Google Sheet Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aviad@kimfo-fs.com', // החלף במייל שלך
        pass: process.env.EMAIL_PASSWORD // הוסף סיסמה ב-.env
    }
});

// Function to create PDF
function createInvestmentAgreementPDF(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50, rtl: true });
            const fileName = `agreement_${data.idNumber}_${Date.now()}.pdf`;
            const pdfPath = path.join(__dirname, fileName);
            const writeStream = fs.createWriteStream(pdfPath);

            doc.pipe(writeStream);

            // Header
            doc.fontSize(20)
                .text('הסכם שיווק השקעות - מובנה', { align: 'center' })
                .fontSize(14)
                .text(`העתק מהטופס שמולא בתאריך ${new Date().toLocaleDateString('he-IL')}`, { align: 'center' })
                .moveDown(2);

            // Personal Details
            doc.fontSize(16)
                .text('פרטים אישיים', { align: 'right' })
                .moveDown(1)
                .fontSize(12)
                .text(`שם מלא: ${data.firstName} ${data.lastName}`, { align: 'right' })
                .text(`תעודת זהות: ${data.idNumber}`, { align: 'right' })
                .text(`אימייל: ${data.email}`, { align: 'right' })
                .text(`טלפון: ${data.phone}`, { align: 'right' })
                .moveDown(2);

            // Investment Details
            doc.fontSize(16)
                .text('פרטי השקעה', { align: 'right' })
                .moveDown(1)
                .fontSize(12)
                .text(`סכום השקעה: ${data.investmentAmount}`, { align: 'right' })
                .text(`בנק: ${data.bank}`, { align: 'right' })
                .text(`מטבע: ${data.currency}`, { align: 'right' })
                .text(`מטרת השקעה: ${data.purpose}`, { align: 'right' })
                .text(`טווח זמן: ${data.timeline}`, { align: 'right' })
                .moveDown(2);

            // Risk Assessment
            doc.fontSize(16)
                .text('שאלון סיכון', { align: 'right' })
                .moveDown(1)
                .fontSize(12)
                .text(`ניסיון בשוק: ${data.marketExperience}`, { align: 'right' })
                .text(`סובלנות לסיכון: ${data.riskTolerance}`, { align: 'right' })
                .text(`תגובה להפסד: ${data.lossResponse}`, { align: 'right' })
                .text(`ידע בהשקעות: ${data.investmentKnowledge}`, { align: 'right' })
                .text(`מגבלות: ${data.investmentRestrictions || 'אין'}`, { align: 'right' })
                .moveDown(2);

            // Declarations
            doc.fontSize(16)
                .text('הצהרות', { align: 'right' })
                .moveDown(1)
                .fontSize(12)
                .text(`הצהרת סיכון: ${data.riskAcknowledgement}`, { align: 'right' })
                .text(`החלטה עצמאית: ${data.independentDecision}`, { align: 'right' })
                .text(`התחייבות לעדכון: ${data.updateCommitment}`, { align: 'right' })
                .moveDown(2);

            // Signature
            if (data.signature) {
                doc.addPage()
                    .fontSize(14)
                    .text('חתימת הלקוח:', { align: 'right' });

                const signatureData = data.signature.split(',')[1];
                if (signatureData) {
                    const imgBuffer = Buffer.from(signatureData, 'base64');
                    doc.image(imgBuffer, { fit: [200, 100], align: 'right' });
                }
            }

            doc.end();

            writeStream.on('finish', () => resolve(pdfPath));
            writeStream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
}

// Function to send email with PDF
async function sendPDFEmail(pdfPath, data) {
    const mailOptions = {
        from: 'aviad@kimfo-fs.com',
        to: data.email,
        cc: 'info@kimfo-fs.com',
        subject: 'הסכם שיווק השקעות - מובנה',
        text: `${data.firstName} שלום,\n\nמצורף העתק של הסכם שיווק ההשקעות שמילאת.\n\nבברכה,\nצוות מובנה`,
        attachments: [{
            filename: path.basename(pdfPath),
            path: pdfPath
        }]
    };

    return transporter.sendMail(mailOptions);
}

async function appendToSheet(data) {
    try {
        console.log('Creating new GoogleSpreadsheet instance...');
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        
        console.log('Authenticating with service account...');
        await doc.useServiceAccountAuth({
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY,
        });

        console.log('Loading document info...');
        await doc.loadInfo();
        
        console.log('Accessing first sheet...');
        const sheet = doc.sheetsByIndex[0];
        
        console.log('Adding row to sheet with data:', { ...data, signature: 'HIDDEN', formScreenshot: 'HIDDEN' });
        await sheet.addRow({
            Timestamp: new Date().toISOString(),
            'שם פרטי': data.firstName,
            'שם משפחה': data.lastName,
            'תעודת זהות': data.idNumber,
            'אימייל': data.email,
            'טלפון': data.phone,
            'סכום השקעה': data.investmentAmount,
            'בנק': data.bank,
            'מטבע': data.currency,
            'מטרת השקעה': data.purpose,
            'מטרה אחרת': data.purposeOther,
            'טווח זמן': data.timeline,
            'ניסיון בשוק': data.marketExperience,
            'רמת סיכון': data.riskTolerance,
            'תגובה להפסד': data.lossResponse,
            'ידע בהשקעות': data.investmentKnowledge,
            'מגבלות': data.investmentRestrictions,
            'הצהרת סיכון': data.riskAcknowledgement,
            'החלטה עצמאית': data.independentDecision,
            'התחייבות לעדכון': data.updateCommitment,
            'חתימה': data.signature || '',
            'צילום טופס': data.formScreenshot || ''
        });
        
        console.log('Row added successfully');
    } catch (error) {
        console.error('Error in appendToSheet:', error);
        throw new Error(`Failed to append to sheet: ${error.message}`);
    }
}

// Routes
app.get(['/', '/index.html', '/index'], (req, res) => {
    res.redirect('/sections/section1.html');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.post('/api/submit', async (req, res) => {
    try {
        console.log('Received form submission');
        const formData = req.body;

        // Validate required fields
        const requiredFields = {
            firstName: 'שם פרטי',
            lastName: 'שם משפחה',
            idNumber: 'תעודת זהות',
            email: 'אימייל',
            phone: 'טלפון'
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field]) {
                throw new Error(`נא למלא ${label}`);
            }
        }

        // Create and save PDF
        const pdfPath = await createInvestmentAgreementPDF(formData);
        console.log('PDF created successfully');

        // Send email with PDF
        await sendPDFEmail(pdfPath, formData);
        console.log('Email sent successfully');

        // Add to Google Sheet
        await appendToSheet(formData);
        console.log('Form processed successfully');

        // Clean up PDF file
        fs.unlink(pdfPath, (err) => {
            if (err) console.error('Error deleting PDF file:', err);
        });
        
        res.json({
            success: true,
            message: 'הטופס נשלח בהצלחה'
        });
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({
            error: 'שגיאה בשליחת הטופס',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({
        error: 'אירעה שגיאה!',
        message: err.message
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Available environment variables:', Object.keys(process.env));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;
