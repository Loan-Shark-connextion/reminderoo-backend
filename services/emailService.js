emailService.js

const sgMail = require('@sendgrid/mail');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text, html) {
    const msg = {
        to,
        from: 'hadimuhammadrahman@gmail.com', // Change to your verified sender
        subject,
        text,
        html,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
        console.error(error.response.body);
        }
        throw error;
    }
}

async function sendSubscriptionReminder(user, subscription) {
    const templatePath = path.join(__dirname, '..', 'templates', 'subscriptionReminderTemplate.md');
    let template = await fs.readFile(templatePath, 'utf8');

    // Replace placeholders with actual data
    template = template.replace('[userName]', user.name)
                        .replace(/\[serviceName\]/g, subscription.app_name)
                        .replace(/\[nextBillingDate\]/g, subscription.next_payment.toDateString())
                        .replace('[billingAmount]', subscription.pricing)
                        .replace('[paymentMethod]', subscription.payment_method);

    await sendEmail(
        user.email,
        `Reminder: Your ${subscription.app_name} subscription is due soon`,
        template,
        template // You might want to convert markdown to HTML for better email rendering
    );
}

module.exports = { sendEmail, sendSubscriptionReminder };