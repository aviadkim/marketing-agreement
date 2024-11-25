// config/email.js
const RESEND_API_KEY = process.env.RESEND_API_KEY; // נוסיף אחר כך ב-Railway

async function sendFormEmail(formData) {
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'מובנה גלובל <info@movne.co.il>',
                to: 'aviad@movne.co.il',
                bcc: formData.email, // העתק ללקוח
                subject: 'הסכם שיווק חדש התקבל - מובנה גלובל',
                html: getEmailTemplate(formData)
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

function getEmailTemplate(data) {
    return `
    <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2 style="color: #0066cc;">הסכם שיווק חדש התקבל</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>פרטי לקוח:</h3>
            <ul>
                <li>שם מלא: ${data.fullName}</li>
                <li>טלפון: ${data.phone}</li>
                <li>דוא"ל: ${data.email}</li>
                <li>ת.ז: ${data.id}</li>
            </ul>
        </div>

        <div style="margin: 20px 0;">
            <h3>פרטי השאלון:</h3>
            <ul>
                ${Object.entries(data.riskProfile || {}).map(([key, value]) => 
                    `<li>${key}: ${value}</li>`
                ).join('')}
            </ul>
        </div>

        <div style="margin-top: 30px; border-top: 2px solid #ddd; padding-top: 20px;">
            <p style="color: #666;">
                הודעה זו נשלחה באופן אוטומטי ממערכת הטפסים של מובנה גלובל.
            </p>
        </div>
    </div>
    `;
}

module.exports = { sendFormEmail };