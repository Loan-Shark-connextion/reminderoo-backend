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
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Error sending email:', {
            to,
            subject,
            error: error.message
        });
        if (error.response) {
            console.error('SendGrid API response:', error.response.body);
        }
        throw error;
    }
}

async function sendSubscriptionReminder(user, subscription) {
    try {
        const templatePath = path.join(__dirname, '..', 'templates', 'subscriptionReminderTemplate.md');
        let template = await fs.readFile(templatePath, 'utf8');

        // Format date from Supabase (ISO string) to a readable format
        const nextBillingDate = new Date(subscription.next_payment).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Replace placeholders with actual data
        template = template
            .replace('[userName]', user.name || 'Valued Customer')
            .replace(/\[serviceName\]/g, subscription.app_name)
            .replace(/\[nextBillingDate\]/g, nextBillingDate)
            .replace('[billingAmount]', subscription.pricing.toFixed(2))
            .replace('[paymentMethod]', subscription.payment_method || 'your saved payment method');

        await sendEmail(
            user.email,
            `Reminder: Your ${subscription.app_name} subscription is due soon`,
            template,
            template // You might want to convert markdown to HTML for better email rendering
        );
        
        console.log(`Reminder sent successfully for subscription ${subscription.id} to ${user.email}`);
    } catch (error) {
        console.error('Error sending subscription reminder:', {
            userId: user.id,
            subscriptionId: subscription.id,
            error: error.message
        });
        throw error;
    }
}

module.exports = { sendEmail, sendSubscriptionReminder };