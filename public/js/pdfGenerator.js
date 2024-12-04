const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // Add sharp for image compression

async function compressImage(imageBuffer, maxWidth = 800) {
    return sharp(imageBuffer)
        .resize(maxWidth, null, {
            withoutEnlargement: true,
            fit: 'inside'
        })
        .jpeg({
            quality: 70,
            progressive: true
        })
        .toBuffer();
}

async function createInvestmentAgreementPDF(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                size: 'A4', 
                margin: 50, 
                rtl: true,
                compress: true, // Enable PDF compression
                info: {
                    Title: 'הסכם שיווק השקעות - מובנה',
                    Author: 'מובנה'
                }
            });

            const fileName = `מובנה_הסכם_שיווק_השקעות_${data.firstName}_${data.lastName}.pdf`;
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
            
            const pdfPath = path.join(tempDir, fileName);
            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);

            // Compress and add logo
            const logoPath = path.join(__dirname, '..', 'images', 'movne-logo.png');
            const logoBuffer = fs.readFileSync(logoPath);
            const compressedLogo = await compressImage(logoBuffer);
            
            doc.image(compressedLogo, {
                fit: [200, 100],
                align: 'center'
            }).moveDown(2);

            // Add document content
            doc.fontSize(20)
                .text('הסכם שיווק השקעות - מובנה', { align: 'center' })
                .fontSize(14)
                .text(`תאריך: ${new Date().toLocaleDateString('he-IL')}`, { align: 'center' })
                .moveDown(2);

            // Add sections with optimized layout
            addSection(doc, 'פרטים אישיים', {
                'שם מלא': `${data.firstName} ${data.lastName}`,
                'תעודת זהות': data.idNumber,
                'אימייל': data.email,
                'טלפון': data.phone
            });

            addSection(doc, 'פרטי השקעה', {
                'סכום השקעה': formatCurrency(data.investmentAmount),
                'בנק': data.bank,
                'מטבע': data.currency,
                'מטרת השקעה': data.purpose,
                'טווח זמן': data.timeline
            });

            addSection(doc, 'שאלון סיכון', {
                'ניסיון בשוק': data.marketExperience,
                'סובלנות לסיכון': data.riskTolerance,
                'תגובה להפסד': data.lossResponse,
                'ידע בהשקעות': data.investmentKnowledge
            });

            addSection(doc, 'הצהרות', {
                'הצהרת הבנת סיכונים': data.riskAcknowledgement === 'true' ? 'כן' : 'לא',
                'החלטה עצמאית': data.independentDecision === 'true' ? 'כן' : 'לא',
                'התחייבות לעדכון': data.updateCommitment === 'true' ? 'כן' : 'לא'
            });

            // Handle signature
            if (data.signature) {
                doc.addPage()
                    .fontSize(14)
                    .text('חתימת הלקוח:', { align: 'right' });

                try {
                    const signatureData = data.signature.split(',')[1];
                    if (signatureData) {
                        const signatureBuffer = Buffer.from(signatureData, 'base64');
                        const compressedSignature = await compressImage(signatureBuffer);
                        doc.image(compressedSignature, { 
                            fit: [200, 100], 
                            align: 'right' 
                        });
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

            writeStream.on('finish', () => {
                // Cleanup temp file after reading
                fs.readFile(pdfPath, (err, data) => {
                    if (!err) {
                        resolve(data);
                        fs.unlink(pdfPath, () => {});
                    } else {
                        reject(err);
                    }
                });
            });
            writeStream.on('error', reject);

        } catch (error) {
            reject(error);
        }
    });
}

function addSection(doc, title, data) {
    doc.fontSize(16)
        .text(title, { align: 'right', underline: true })
        .moveDown(1)
        .fontSize(12);
    
    Object.entries(data).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, { align: 'right' });
    });
    
    doc.moveDown(2);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS'
    }).format(amount);
}

module.exports = { createInvestmentAgreementPDF };
