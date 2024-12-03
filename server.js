require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const app = express();

// Environment variable checks
if (!process.env.GOOGLE_PRIVATE_KEY) {
    console.error('GOOGLE_PRIVATE_KEY is missing from environment variables');
    process.exit(1);
}

if (!process.env.GOOGLE_SPREADSHEET_ID) {
    console.error('GOOGLE_SPREADSHEET_ID is missing from environment variables');
    process.exit(1);
}

if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.error('GOOGLE_SERVICE_ACCOUNT_EMAIL is missing from environment variables');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Google Sheet Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

async function appendToSheet(data) {
    try {
        console.log('Creating new GoogleSpreadsheet instance...');
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        
        console.log('Authenticating with service account...');
        await doc.useServiceAccountAuth({
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY,
        });

        console.log('Loading document info...');
        await doc.loadInfo();
        
        console.log('Accessing first sheet...');
        const sheet = doc.sheetsByIndex[0];
        
        console.log('Adding row to sheet with data:', { ...data, signature: 'HIDDEN', formScreenshot: 'HIDDEN' });
        await sheet.addRow({
            Timestamp: new Date().toISOString(),
            'שם פרטי': data.firstName,
            'שם משפחה': data.lastName,
            'תעודת זהות': data.idNumber,
            'אימייל': data.email,
            'טלפון': data.phone,
            'סכום השקעה': data.investmentAmount,
            'בנק': data.bank,
            'מטבע': data.currency,
            'מטרת השקעה': data.purpose,
            'מטרה אחרת': data.purposeOther,
            'טווח זמן': data.timeline,
            'ניסיון בשוק': data.marketExperience,
            'רמת סיכון': data.riskTolerance,
            'תגובה להפסד': data.lossResponse,
            'ידע בהשקעות': data.investmentKnowledge,
            'מגבלות': data.investmentRestrictions,
            'הצהרת סיכון': data.riskAcknowledgement,
            'החלטה עצמאית': data.independentDecision,
            'התחייבות לעדכון': data.updateCommitment,
            'חתימה': data.signature || '',
            'צילום טופס': data.formScreenshot || ''
        });
        
        console.log('Row added successfully');
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

        await appendToSheet(formData);
        console.log('Form processed successfully');
        
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({
        error: 'אירעה שגיאה!',
        message: err.message
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Available environment variables:', Object.keys(process.env));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
