const supabase = require('../db');
const { sendSubscriptionReminder } = require('./emailService');

async function checkAndSendReminders() {
    try {
        const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select(`
                *,
                users:user_id (
                    name,
                    email
                )
            `)
            .lte('next_payment', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        console.log(`Found ${subscriptions.length} subscriptions due for reminders`);

        for (const subscription of subscriptions) {
            try {
                await sendSubscriptionReminder(
                    { name: subscription.users.name, email: subscription.users.email },
                    subscription
                );
                console.log(`Sent reminder for subscription ${subscription.id} to ${subscription.users.email}`);
            } catch (error) {
                console.error(`Error sending reminder for subscription ${subscription.id}:`, error);
            }
        }

        console.log(`Completed sending ${subscriptions.length} reminder(s)`);
    } catch (error) {
        console.error('Error checking and sending reminders:', error);
        throw error;
    }
}

module.exports = { checkAndSendReminders };