require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const app = express();

// בדיקת משתני סביבה
if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.error('Missing required environment variables');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// קונפיגורציה
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
const TEMP_DIR = path.join(__dirname, 'temp');

// יצירת תיקיית temp אם לא קיימת
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// קונפיגורציית אימייל
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

function formatCurrency(amount) {
    if (!amount) return '0 ₪';
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 0
    }).format(amount);
}

async function createInvestmentAgreementPDF(data, formImages) {
    return new Promise((resolve, reject) => {
        try {
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

            const fileName = `agreement_${data.idNumber}_${Date.now()}.pdf`;
            const pdfPath = path.join(TEMP_DIR, fileName);
            const writeStream = fs.createWriteStream(pdfPath);

            doc.pipe(writeStream);

            // Add form images if available
            if (formImages && formImages.length) {
                formImages.forEach((imgData, index) => {
                    if (index > 0) doc.addPage();
                    try {
                        const imgBuffer = Buffer.from(imgData.split(',')[1], 'base64');
                        doc.image(imgBuffer, {
                            fit: [500, 700],
                            align: 'center',
                            valign: 'center'
                        });
                    } catch (err) {
                        console.error('Error adding form image:', err);
                    }
                });
            }

            // Add generated content
            doc.addPage();

            // Logo
            const logoPath = path.join(__dirname, 'public', 'images', 'movne-logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, {
                    fit: [200, 100],
                    align: 'center'
                }).moveDown(2);
            }

            // Content sections
            addHeader(doc, data);
            addPersonalDetails(doc, data);
            addInvestmentDetails(doc, data);
            addRiskAssessment(doc, data);
            addDeclarations(doc, data);
            addSignature(doc, data);
            addFooter(doc);

            doc.end();

            writeStream.on('finish', () => resolve(pdfPath));
            writeStream.on('error', reject);

        } catch (error) {
            reject(error);
        }
    });
}

// Helper functions for PDF sections
function addHeader(doc, data) {
    doc.fontSize(20)
        .text('הסכם שיווק השקעות - מובנה', { align: 'center' })
        .fontSize(14)
        .text(`תאריך: ${new Date().toLocaleDateString('he-IL')}`, { align: 'center' })
        .moveDown(2);
}

function addPersonalDetails(doc, data) {
    doc.fontSize(16)
        .text('פרטים אישיים', { align: 'right', underline: true })
        .moveDown(1)
        .fontSize(12)
        .text(`שם מלא: ${data.firstName} ${data.lastName}`, { align: 'right' })
        .text(`תעודת זהות: ${data.idNumber}`, { align: 'right' })
        .text(`אימייל: ${data.email}`, { align: 'right' })
        .text(`טלפון: ${data.phone}`, { align: 'right' })
        .moveDown(2);
}

function addInvestmentDetails(doc, data) {
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
}

function addRiskAssessment(doc, data) {
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
}

function addDeclarations(doc, data) {
    doc.fontSize(16)
        .text('הצהרות', { align: 'right', underline: true })
        .moveDown(1)
        .fontSize(12)
        .text(`הצהרת הבנת סיכונים: ${data.riskAcknowledgement ? 'כן' : 'לא'}`, { align: 'right' })
        .text(`החלטה עצמאית: ${data.independentDecision ? 'כן' : 'לא'}`, { align: 'right' })
        .text(`התחייבות לעדכון: ${data.updateCommitment ? 'כן' : 'לא'}`, { align: 'right' })
        .moveDown(2);
}

function addSignature(doc, data) {
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
}

function addFooter(doc) {
    doc.fontSize(10)
        .moveDown(4)
        .text('מסמך זה הופק אוטומטית על ידי מערכת מובנה', { align: 'center' });
}

async function sendPDFEmail(pdfPath, data) {
    const emailTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'email.html'), 'utf8');
    const compiledTemplate = eval('`' + emailTemplate + '`');

    const mailOptions = {
        from: {
            name: 'מובנה',
            address: process.env.EMAIL_USER
        },
        to: data.email,
        cc: 'info@movne.co.il',
        subject: `הסכם שיווק השקעות - ${data.firstName} ${data.lastName}`,
        html: compiledTemplate,
        attachments: [
            {
                filename: `הסכם_שיווק_השקעות_${data.firstName}_${data.lastName}.pdf`,
                path: pdfPath
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
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY,
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        
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
        });
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

        // Create PDF with form images
        const pdfPath = await createInvestmentAgreementPDF(formData, formData.formImages);
        console.log('PDF created successfully');

        // Send email
        await sendPDFEmail(pdfPath, formData);
        console.log('Email sent successfully');

        // Add to sheet
        await appendToSheet(formData);
        console.log('Data added to sheet successfully');

        // Cleanup
        fs.unlink(pdfPath, err => {
            if (err) console.error('Error deleting PDF:', err);
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

// Error handling
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'אירעה שגיאה!',
        message: err.message
    });
});

// Server startup
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;
