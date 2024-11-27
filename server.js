const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // הגדלת הלימיט בגלל החתימה והתמונות
app.use(express.static(path.join(__dirname, 'public')));

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
        if (!formData.name || !formData.idNumber) {
            throw new Error('Missing required fields');
        }

        // Log success
        console.log('Form processed successfully');
        console.log('Email:', formData.email);
        
        res.json({
            success: true,
            message: 'Form submitted successfully'
        });
        
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({
            error: 'Failed to process form',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something broke!',
        message: err.message
    });
});

// Configuration
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
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