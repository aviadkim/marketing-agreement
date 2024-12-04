const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

function formatCurrency(amount) {
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS'
    }).format(amount);
}

async function createInvestmentAgreementPDF(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                size: 'A4', 
                margin: 50, 
                rtl: true,
                info: {
                    Title: 'הסכם שיווק השקעות - מובנה',
                    Author: 'מובנה'
                }
            });

            const fileName = `מובנה_הסכם_שיווק_השקעות_${data.firstName}_${data.lastName}.pdf`;
            const pdfPath = path.join(__dirname, '..', '..', 'temp', fileName);
            
            // Create temp directory if it doesn't exist
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);

            // Logo
            doc.image(path.join(__dirname, '..', 'images', 'movne-logo.png'), {
                fit: [200, 100],
                align: 'center'
            }).moveDown(2);

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
                .text(`מטרת השקעה: ${data.purpose}`, { align: 'right' })
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
                .text(`ידע בהשקעות: ${data.investmentKnowledge}`, { align: 'right' })
                .moveDown(2);

            // Declarations
            doc.fontSize(16)
                .text('הצהרות', { align: 'right', underline: true })
                .moveDown(1)
                .fontSize(12)
                .text(`הצהרת הבנת סיכונים: ${data.riskAcknowledgement === 'true' ? 'כן' : 'לא'}`, { align: 'right' })
                .text(`החלטה עצמאית: ${data.independentDecision === 'true' ? 'כן' : 'לא'}`, { align: 'right' })
                .text(`התחייבות לעדכון: ${data.updateCommitment === 'true' ? 'כן' : 'לא'}`, { align: 'right' })
                .moveDown(2);

            // Signature
            if (data.signature) {
                doc.addPage()
                    .fontSize(14)
                    .text('חתימת הלקוח:', { align: 'right' });

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

module.exports = { createInvestmentAgreementPDF };
