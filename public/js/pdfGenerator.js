// בserver.js, נוסיף בתחילת הקובץ:
const { createInvestmentAgreementPDF } = require('./pdfFormatter');
const fs = require('fs');

// בתוך הפונקציה הקיימת של שליחת הטופס, נוסיף:
app.post('/api/submit', async (req, res) => {
    try {
        const formData = req.body;
        
        // יצירת הPDF
        const pdfDoc = createInvestmentAgreementPDF(formData);
        const fileName = `agreement_${formData.idNumber}_${Date.now()}.pdf`;
        const pdfPath = `./${fileName}`;
        
        const writeStream = fs.createWriteStream(pdfPath);
        pdfDoc.pipe(writeStream);
        pdfDoc.end();

        // המתנה שהקובץ ייווצר
        await new Promise((resolve) => writeStream.on('finish', resolve));
        
        // המשך הקוד הקיים של שליחת המייל, רק נוסיף את הPDF כצרופה
        const mailOptions = {
            // ... הגדרות המייל הקיימות שלך
            attachments: [{
                filename: fileName,
                path: pdfPath
            }]
        };

        // אחרי שליחת המייל, נמחק את הקובץ הזמני
        fs.unlink(pdfPath, (err) => {
            if (err) console.error('Error deleting temp PDF:', err);
        });

        // המשך הקוד הקיים...
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});
