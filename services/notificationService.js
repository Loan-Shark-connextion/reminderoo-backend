const pool = require('../db');
const { sendSubscriptionReminder } = require('./emailService');

async function checkAndSendReminders() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [subscriptions] = await connection.query(
        'SELECT s.*, u.name, u.email FROM subscriptions s JOIN users u ON s.user_id = u.id WHERE s.next_payment <= DATE_ADD(CURDATE(), INTERVAL s.interval_days DAY)'
        );

        console.log(`Found ${subscriptions.length} subscriptions due for reminders`);

        for (const subscription of subscriptions) {
        try {
            await sendSubscriptionReminder(
            { name: subscription.name, email: subscription.email },
            subscription
            );
            console.log(`Sent reminder for subscription ${subscription.id} to ${subscription.email}`);
        } catch (error) {
            console.error(`Error sending reminder for subscription ${subscription.id}:`, error);
        }
        }

        await connection.commit();
        console.log(`Completed sending ${subscriptions.length} reminder(s)`);
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error checking and sending reminders:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

module.exports = { checkAndSendReminders };