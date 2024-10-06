// test-email.js
const { sendEmail } = require('./services/emailService');
const { emailTemplate } = require('./templates/emailTemplate');

async function testEmailSending() {
    try {
        const testUser = {
            name: "Test User",
            email: "your-test-email@example.com"  // Replace with your email
        };
        
        const testSubscriptions = [{
            app_name: "Netflix",
            category: "Entertainment",
            pricing: 15.99,
            cycle: "Monthly",
            start_payment: "2024-01-01",
            next_payment: "2024-02-01",
            payment_method: "Credit Card",
            status: "upcoming"
        }];

        const htmlContent = emailTemplate(testUser.name, testSubscriptions);
        
        await sendEmail(
            testUser.email,
            'Test: Subscription Payment Reminder',
            'This is a test email for subscription reminders.',
            htmlContent
        );
        
        console.log('Test email sent successfully');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testEmailSending();