// test-all-reminders.js
const supabase = require('./db');
const { checkAndSendReminders } = require('./services/notificationService');
const { emailTemplate } = require('./templates/emailTemplate');
const { sendEmail } = require('./services/emailService');

async function testAllUsersReminders() {
    try {
        console.log('Starting test for all users...');
        
        // 1. First, let's get all active users with their subscriptions
        const { data: users, error: userError } = await supabase
            .from('users')
            .select(`
                id,
                name,
                email,
                subscriptions (
                    id,
                    app_name,
                    category,
                    pricing,
                    start_payment,
                    next_payment,
                    status,
                    cycle,
                    payment_method
                )
            `);

        if (userError) throw userError;

        console.log(`Found ${users.length} users to check`);

        // 2. Process each user
        for (const user of users) {
            console.log(`\nProcessing user: ${user.email}`);
            
            if (!user.subscriptions || user.subscriptions.length === 0) {
                console.log('No subscriptions found for this user');
                continue;
            }

            console.log(`Found ${user.subscriptions.length} subscriptions`);

            // Filter subscriptions that need reminders
            const currentDate = new Date();
            const remindableSubscriptions = user.subscriptions.filter(sub => {
                const nextPayment = new Date(sub.next_payment);
                const daysUntilPayment = Math.floor((nextPayment - currentDate) / (1000 * 60 * 60 * 24));
                return daysUntilPayment <= 7 && daysUntilPayment >= 0; // Within next 7 days
            });

            if (remindableSubscriptions.length > 0) {
                console.log(`Sending reminder for ${remindableSubscriptions.length} subscriptions`);
                
                // Generate email content
                const htmlContent = emailTemplate(user.name, remindableSubscriptions);
                
                // Send the email
                try {
                    await sendEmail(
                        user.email,
                        'Test: Your Subscription Reminders',
                        `You have ${remindableSubscriptions.length} subscription(s) due soon.`,
                        htmlContent
                    );
                    console.log(`Successfully sent email to ${user.email}`);
                } catch (emailError) {
                    console.error(`Failed to send email to ${user.email}:`, emailError);
                }
                
                // Log subscription details
                remindableSubscriptions.forEach(sub => {
                    console.log(`- ${sub.app_name}: Due on ${new Date(sub.next_payment).toLocaleDateString()}`);
                });
            } else {
                console.log('No reminders needed for this user');
            }
        }

        console.log('\nTest completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// If running this file directly, execute the test
if (require.main === module) {
    console.log('Running reminder test for all users...');
    testAllUsersReminders()
        .then(() => console.log('Test complete'))
        .catch(err => console.error('Test failed:', err));
}

module.exports = { testAllUsersReminders };