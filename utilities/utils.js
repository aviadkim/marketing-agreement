const { GoogleSpreadsheet } = require('google-spreadsheet');
const PDFDocument = require('pdfkit');
const { sendEmail } = require('../email');
const fs = require('fs');
const path = require('path');

// Config variables
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
const TEMP_DIR = path.join(__dirname, 'temp');

// Create temp directory if doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

function formatCurrency(amount) {
    if (!amount) return '0 ₪';
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 0
    }).format(amount);
}

async function createInvestmentAgreementPDF(data, formImages = []) {
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

            // Add captured form images
            if (formImages.length > 0) {
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

            // Add generated PDF content
            doc.addPage();

            // Add logo
            const logoPath = path.join(__dirname, '../public/images/movne-logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, {
                    fit: [200, 100],
                    align: 'center'
                }).moveDown(2);
            }

            // Add content sections
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

// PDF Section Helpers
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
        throw error;
    }
}

module.exports = {
    createInvestmentAgreementPDF,
    appendToSheet
};
