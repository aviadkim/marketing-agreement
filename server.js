const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Basic health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check called');
  res.status(200).json({ status: 'ok' });
});

// Serve the form
app.get('/', (req, res) => {
  try {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Server error');
  }
});

// Handle form submission
app.post('/submit', async (req, res) => {
  try {
    const formData = req.body;
    console.log('Received form data:', formData);
    res.json({ success: true });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Current directory:', __dirname);
  console.log('Files in directory:', require('fs').readdirSync(__dirname));
});