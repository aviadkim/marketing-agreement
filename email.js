const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

function createEmailTemplate(data) {
    return `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .logo {
                display: block;
                margin: 20px auto;
                max-width: 200px;
            }
            .details {
                margin: 20px 0;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 4px;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                font-size: 0.9em;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="cid:logo" alt="מובנה" class="logo">
            
            <h2 style="text-align: center;">הסכם שיווק השקעות - מובנה</h2>
            
            <p>שלום ${data.firstName},</p>
            
            <p>תודה על מילוי הסכם שיווק ההשקעות.</p>
            <p>מצורף העתק של ההסכם שמילאת בתאריך ${new Date().toLocaleDateString('he-IL')}</p>
            
            <div class="details">
                <h3>פרטי ההסכם:</h3>
                <ul style="list-style-type: none; padding: 0;">
                    <li>סכום השקעה: ${data.investmentAmount}</li>
                    <li>בנק: ${data.bank}</li>
                    <li>מטבע: ${data.currency}</li>
                    <li>מטרת השקעה: ${data.purpose}</li>
                </ul>
            </div>
            
            <p>צוות מובנה ייצור איתך קשר בהקדם לגבי המשך התהליך.</p>
            
            <p>במידה ויש לך שאלות נוספות, ניתן ליצור קשר בטלפון: 03-XXXXXXX</p>
            
            <div class="footer">
                <p>בברכה,<br>צוות מובנה</p>
                <p style="font-size: 0.8em; color: #999;">
                    מסמך זה נשלח באופן אוטומטי, אין להשיב למייל זה
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

async function sendEmail(data, pdfPath) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: {
            name: 'מובנה',
            address: process.env.EMAIL_USER
        },
        to: data.email,
        cc: 'info@movne.co.il',
        subject: `הסכם שיווק השקעות - ${data.firstName} ${data.lastName}`,
        html: createEmailTemplate(data),
        attachments: [
            {
                filename: `הסכם_שיווק_השקעות_${data.firstName}_${data.lastName}.pdf`,
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

module.exports = { sendEmail };
