const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json({limit: '50mb'}));

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "info@movne.co.il",
        pass: "wnxi vwum ugpf sack"  // App Password ?????
    }
});
