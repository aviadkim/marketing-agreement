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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to format currency
function formatCurrency(amount) {
    if (!amount) return '0 ₪';
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 0
    }).format(amount);
}

// Function to create PDF
async function createInvestmentAgreementPDF(data) {
    return new Promise((resolve, reject) => {
        try {
            // Create temp directory if it doesn't exist
            const tempDir = path.join(__dirname, 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const doc = new PDFDocument({ 
                size: 'A4', 
                margin: 50, 
                rtl: true,
                info: {
                    Title: 'הסכם שיווק השקעות - מובנה',
                    Author: 'מובנה',
                    Subject: `הסכם שיווק השקעות - ${data.firstName} ${data.lastName}`
                }
            });

            const fileName = `מובנה_הסכם_שיווק_השקעות_${data.firstName}_${data.lastName}.pdf`;
            const pdfPath = path.join(tempDir, fileName);
            const writeStream = fs.createWriteStream(pdfPath);

            doc.pipe(writeStream);

            // Logo
            const logoPath = path.join(__dirname, 'public', 'images', 'movne-logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, {
                    fit: [200, 100],
                    align: 'center'
                }).moveDown(2);
            }

            // Header
            doc.fontSize(20)
                .text('הסכם שיווק השקעות - מובנה', { align: 'center' })
                .fontSize(14)
                .text(`תאריך: ${new Date().toLocaleDateString('he-IL')}`, { align: 'center' })
                .moveDown(2);

            // Personal Details
            doc.fontSize(16)
                .text('פרטים אישיים', { align: 'right', underline: true })
                .moveDown(1)
                .fontSize(12)
                .text(`שם מלא: ${data.firstName} ${data.lastName}`, { align: 'right' })
                .text(`תעודת זהות: ${data.idNumber}`, { align: 'right' })
                .text(`אימייל: ${data.email}`, { align: 'right' })
                .text(`טלפון: ${data.phone}`, { align: 'right' })
                .moveDown(2);

            // Investment Details
            doc.fontSize(16)
                .text('פרטי השקעה', { align: 'right', underline: true })
                .moveDown(1)
                .fontSize(12)
                .text(`סכום השקעה: ${formatCurrency(data.investmentAmount)}`, { align: 'right' })
                .text(`בנק: ${data.bank}`, { align: 'right' })
                .text(`מטבע: ${data.currency}`, { align: 'right' })
                .text(`מטרת השקעה: ${Array.isArray(data.purpose) ? data.purpose.join(', ') : data.purpose}`, { align: 'right' })
                .text(`טווח זמן: ${data.timeline}`, { align: 'right' })
                .moveDown(2);

            // Risk Assessment
            doc.fontSize(16)
                .text('שאלון סיכון', { align: 'right', underline: true })
                .moveDown(1)
                .fontSize(12)
                .text(`ניסיון בשוק: ${data.marketExperience}`, { align: 'right' })
                .text(`סובלנות לסיכון: ${data.riskTolerance}`, { align: 'right' })
                .text(`תגובה להפסד: ${data.lossResponse}`, { align: 'right' })
                .text(`ידע בהשקעות: ${Array.isArray(data.investmentKnowledge) ? data.investmentKnowledge.join(', ') : data.investmentKnowledge}`, { align: 'right' })
                .text(`מגבלות: ${data.investmentRestrictions || 'אין'}`, { align: 'right' })
                .moveDown(2);

            // Declarations
            doc.fontSize(16)
                .text('הצהרות', { align: 'right', underline: true })
                .moveDown(1)
                .fontSize(12)
                .text(`הצהרת הבנת סיכונים: ${data.riskAcknowledgement === 'on' || data.riskAcknowledgement === true ? 'כן' : 'לא'}`, { align: 'right' })
                .text(`החלטה עצמאית: ${data.independentDecision === 'on' || data.independentDecision === true ? 'כן' : 'לא'}`, { align: 'right' })
                .text(`התחייבות לעדכון: ${data.updateCommitment === 'on' || data.updateCommitment === true ? 'כן' : 'לא'}`, { align: 'right' })
                .moveDown(2);

            // Signature
            if (data.signature) {
                doc.addPage()
                    .fontSize(14)
                    .text('חתימת הלקוח:', { align: 'right' })
                    .moveDown(1);

                try {
                    const signatureData = data.signature.split(',')[1];
                    if (signatureData) {
                        const imgBuffer = Buffer.from(signatureData, 'base64');
                        doc.image(imgBuffer, { fit: [200, 100], align: 'right' });
                    }
                } catch (error) {
                    console.error('Error processing signature:', error);
                }
            }

            // Footer
            doc.fontSize(10)
                .moveDown(4)
                .text('מסמך זה הופק אוטומטית על ידי מערכת מובנה', { align: 'center' });

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
    const emailTemplate = `
    <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="cid:logo" alt="מובנה" style="display: block; margin: 20px auto; max-width: 200px;">
        <h2 style="text-align: center; color: #333;">הסכם שיווק השקעות - מובנה</h2>
        <p style="font-size: 16px; line-height: 1.5;">
            שלום ${data.firstName},
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
            תודה על מילוי הסכם שיווק ההשקעות.
            מצורף העתק של ההסכם שמילאת בתאריך ${new Date().toLocaleDateString('he-IL')}.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
            במידה ויש לך שאלות נוספות, אנחנו כאן לשירותך.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
            בברכה,<br>
            צוות מובנה
        </p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
            מסמך זה נשלח באופן אוטומטי, אין להשיב למייל זה
        </p>
    </div>
    `;

    const mailOptions = {
        from: {
            name: 'מובנה',
            address: process.env.EMAIL_USER
        },
        to: data.email,
        cc: 'info@movne.co.il',
        subject: `הסכם שיווק השקעות - ${data.firstName} ${data.lastName}`,
        html: emailTemplate,
        attachments: [
            {
                filename: path.basename(pdfPath),
                path: pdfPath,
                contentType: 'application/pdf'
            },
            {
                filename: 'logo.png',
                path: path.join(__dirname, 'public', 'images', 'movne-logo.png'),
                cid: 'logo'
            }
        ]
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
        
        console.log('Adding row to sheet with data:', { ...data, signature: 'HIDDEN' });
        await sheet.addRow({
            Timestamp: new Date().toISOString(),
            'שם פרטי': data.firstName,
            'שם משפחה': data.lastName,
            'תעודת זהות': data.idNumber,
            'אימייל': data.email,
            'טלפון': data.phone,
            'סכום השקעה': formatCurrency(data.investmentAmount),
            'בנק': data.bank,
            'מטבע': data.currency,
            'מטרת השקעה': Array.isArray(data.purpose) ? data.purpose.join(', ') : data.purpose,
            'מטרה אחרת': data.purposeOther,
            'טווח זמן': data.timeline,
            'ניסיון בשוק': data.marketExperience,
            'רמת סיכון': data.riskTolerance,
            'תגובה להפסד': data.lossResponse,
            'ידע בהשקעות': Array.isArray(data.investmentKnowledge) ? data.investmentKnowledge.join(', ') : data.investmentKnowledge,
            'מגבלות': data.investmentRestrictions,
            'הצהרת סיכון': data.riskAcknowledgement === 'on' || data.riskAcknowledgement === true ? 'כן' : 'לא',
            'החלטה עצמאית': data.independentDecision === 'on' || data.independentDecision === true ? 'כן' : 'לא',
            'התחייבות לעדכון': data.updateCommitment === 'on' || data.updateCommitment === true ? 'כן' : 'לא',
            'חתימה': 'נחתם',
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
        console.log('PDF created successfully at:', pdfPath);

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
