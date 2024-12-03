const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Google Apps Script URL
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

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

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.idNumber || !formData.email || !formData.phone) {
            throw new Error('נא למלא את כל שדות החובה');
        }

        // Send to Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to submit to Google Sheets');
        }

        // Log success
        console.log('Form processed successfully');
        console.log('Email:', formData.email);

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
