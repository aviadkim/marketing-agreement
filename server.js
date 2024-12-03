const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Google Apps Script URL from environment variable
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz2Cu2YDQwHz5acvMFx7GzN9ht2BiuQkRI459f7_75y96Hh2BAUMimYl3e2XYEr_uhh/exec';

// Redirects
app.get(['/', '/index.html', '/index'], (req, res) => {
    res.redirect('/sections/section1.html');
});

// Force HTTPS
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Main form submission endpoint 
app.post('/api/submit', async (req, res) => {
    try {
        console.log('Received form submission');
        const formData = req.body;
        console.log('Form data:', formData);

        // Validate all required fields
        const requiredFields = {
            firstName: 'שם פרטי',
            lastName: 'שם משפחה',
            idNumber: 'תעודת זהות',
            email: 'אימייל',
            phone: 'טלפון'
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field]) {
                console.log(`Missing required field: ${field}`);
                throw new Error(`נא למלא ${label}`);
            }
        }

        // Send to Google Sheets
        const sheetResponse = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Section 1
                firstName: formData.firstName,
                lastName: formData.lastName,
                idNumber: formData.idNumber,
                email: formData.email,
                phone: formData.phone,

                // Section 2
                investmentAmount: formData.investmentAmount,
                bank: formData.bank,
                currency: formData.currency,
                purpose: formData.purpose,
                timeline: formData.timeline,

                // Section 3
                marketExperience: formData.marketExperience,
                riskTolerance: formData.riskTolerance,
                lossResponse: formData.lossResponse,

                // Section 4
                riskAcknowledgement: formData.riskAcknowledgement,
                independentDecision: formData.independentDecision,
                updateCommitment: formData.updateCommitment,

                // Signature
                signature: formData.signature,

                // Metadata
                submissionDate: new Date().toISOString()
            })
        });

        if (!sheetResponse.ok) {
            throw new Error('Failed to submit to Google Sheets');
        }

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
    console.error(err.stack);
    res.status(500).json({
        error: 'אירעה שגיאה!',
        message: err.message
    });
});

// Configuration
const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
