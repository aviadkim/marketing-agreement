// pdfGenerator.js

const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');

class PDFGenerator {
    constructor(formData) {
        this.formData = formData;
        this.doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });
    }

    async generatePDF() {
        const fileName = `agreement_${this.formData.idNumber}_${Date.now()}.pdf`;
        const stream = fs.createWriteStream(fileName);

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(fileName));
            stream.on('error', reject);

            // הגדרת כיוון מימין לשמאל
            this.doc.font('Helvetica');
            
            // כותרת
            this.addHeader();
            
            // פרטים אישיים
            this.addSection('פרטים אישיים', {
                'שם פרטי': this.formData.firstName,
                'שם משפחה': this.formData.lastName,
                'תעודת זהות': this.formData.idNumber,
                'דואר אלקטרוני': this.formData.email,
                'טלפון': this.formData.phone
            });

            // פרטי השקעה
            this.addSection('פרטי השקעה', {
                'סכום השקעה': this.formatCurrency(this.formData.investmentAmount),
                'בנק': this.formData.bank,
                'מטבע': this.formData.currency,
                'מטרת השקעה': this.formData.purpose,
                'טווח זמן': this.formData.timeline
            });

            // שאלון סיכון
            this.addSection('שאלון סיכון', {
                'ניסיון בשוק ההון': this.formData.marketExperience,
                'סובלנות לסיכון': this.formData.riskTolerance,
                'תגובה להפסד': this.formData.lossResponse,
                'ידע בהשקעות': this.formData.investmentKnowledge,
                'מגבלות השקעה': this.formData.investmentRestrictions
            });

            // הצהרות
            this.addDeclarations();

            // חתימה
            if (this.formData.signature) {
                this.addSignature();
            }

            // תאריך ושעה
            this.addFooter();

            this.doc.pipe(stream);
            this.doc.end();
        });
    }

    addHeader() {
        this.doc
            .fontSize(20)
            .text('הסכם שיווק השקעות - מובנה', {
                align: 'center'
            })
            .moveDown(2);
    }

    addSection(title, fields) {
        this.doc
            .fontSize(16)
            .text(title, {
                align: 'right',
                underline: true
            })
            .moveDown(1);

        Object.entries(fields).forEach(([key, value]) => {
            if (value) {
                this.doc
                    .fontSize(12)
                    .text(`${key}: ${value}`, {
                        align: 'right'
                    });
            }
        });

        this.doc.moveDown(2);
    }

    addDeclarations() {
        this.doc
            .fontSize(16)
            .text('הצהרות', {
                align: 'right',
                underline: true
            })
            .moveDown(1)
            .fontSize(12);

        const declarations = {
            riskAcknowledgement: 'הבנת סיכונים',
            independentDecision: 'החלטה עצמאית',
            updateCommitment: 'התחייבות לעדכון פרטים'
        };

        Object.entries(declarations).forEach(([key, title]) => {
            const value = this.formData[key] === 'כן' ? '✓' : '✗';
            this.doc.text(`${title}: ${value}`, {
                align: 'right'
            });
        });

        this.doc.moveDown(2);
    }

    addSignature() {
        this.doc
            .fontSize(14)
            .text('חתימת הלקוח:', {
                align: 'right'
            })
            .moveDown(1);

        // המרת חתימה מbase64 לתמונה
        const signatureData = this.formData.signature.split(',')[1];
        if (signatureData) {
            const imgBuffer = Buffer.from(signatureData, 'base64');
            this.doc.image(imgBuffer, {
                fit: [200, 100],
                align: 'right'
            });
        }

        this.doc.moveDown(2);
    }

    addFooter() {
        const now = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
        this.doc
            .fontSize(10)
            .text(`מסמך זה נוצר אוטומטית בתאריך: ${now}`, {
                align: 'center'
            });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS'
        }).format(amount);
    }
}

// פונקציה לשליחת המייל
async function sendPDFEmail(pdfPath, recipientEmail) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: recipientEmail,
        cc: 'info@kimfo-fs.com',
        subject: 'הסכם שיווק השקעות - מובנה',
        text: 'מצורף הסכם שיווק השקעות שמולא באתר.',
        attachments: [{
            filename: pdfPath.split('/').pop(),
            path: pdfPath
        }]
    };

    return transporter.sendMail(mailOptions);
}

module.exports = {
    PDFGenerator,
    sendPDFEmail
};
