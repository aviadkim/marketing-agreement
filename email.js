const nodemailer = require('nodemailer');
const path = require('path');

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

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

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = { sendPDFEmail };
