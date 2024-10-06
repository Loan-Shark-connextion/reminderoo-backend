const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text, html) {
    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'your-verified-sender@example.com',
        subject,
        text,
        html,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('SendGrid API response:', error.response.body);
        }
        throw error;
    }
}

module.exports = { sendEmail };