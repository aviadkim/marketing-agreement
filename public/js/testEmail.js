const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'info@movne.co.il',
        pass: 'Kimfo1982!'
    }
});

const mailOptions = {
    from: 'info@movne.co.il',
    to: 'akimche@gmail.com',
    subject: 'Test Email',
    text: 'This is a test email from the test script.',
    attachments: [
        {
            filename: 'test.pdf',
            content: 'Test PDF content',
            contentType: 'application/pdf'
        }
    ]
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.error('Error sending email:', error);
    }
    console.log('Email sent successfully:', info.response);
});
