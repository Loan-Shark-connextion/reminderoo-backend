const supabase = require('../db');
const { sendEmail } = require('./emailService');
const { emailTemplate } = require('../templates/emailTemplate');

const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    UPCOMING: 'upcoming',
    OVERDUE: 'overdue'
};

const UPCOMING_THRESHOLD_DAYS = 7;

async function updateSubscriptionStatus(subscription) {
    const currentDate = new Date();
    const nextPaymentDate = new Date(subscription.next_payment);
    const daysDifference = Math.floor((nextPaymentDate - currentDate) / (1000 * 60 * 60 * 24));

    let newStatus;
    if (subscription.status === SUBSCRIPTION_STATUS.INACTIVE) {
        return null; // Don't update inactive subscriptions
    } else if (daysDifference < 0) {
        newStatus = SUBSCRIPTION_STATUS.OVERDUE;
    } else if (daysDifference <= UPCOMING_THRESHOLD_DAYS) {
        newStatus = SUBSCRIPTION_STATUS.UPCOMING;
    } else {
        newStatus = SUBSCRIPTION_STATUS.ACTIVE;
    }

    if (newStatus !== subscription.status) {
        const { data, error } = await supabase
            .from('subscriptions')
            .update({ status: newStatus })
            .eq('id', subscription.id)
            .select()
            .single();

        if (error) throw error;
        return { ...data, statusChanged: true };
    }

    return { ...subscription, statusChanged: false };
}

async function checkAndSendReminders() {
    try {
        // Fetch all active and upcoming subscriptions
        const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select(`
                *,
                users:user_id (
                    name,
                    email
                )
            `)
            .in('status', [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.UPCOMING]);

        if (error) throw error;

        const userSubscriptions = {};
        const updatedSubscriptions = [];

        // Update statuses and group subscriptions by user
        for (const subscription of subscriptions) {
            const updatedSubscription = await updateSubscriptionStatus(subscription);
            if (updatedSubscription) {
                updatedSubscriptions.push(updatedSubscription);
                
                if (updatedSubscription.statusChanged) {
                    const userId = subscription.user_id;
                    if (!userSubscriptions[userId]) {
                        userSubscriptions[userId] = {
                            user: subscription.users,
                            subscriptions: []
                        };
                    }
                    userSubscriptions[userId].subscriptions.push(updatedSubscription);
                }
            }
        }

        // Send emails for users with status changes
        for (const userId in userSubscriptions) {
            const { user, subscriptions } = userSubscriptions[userId];
            const emailHtml = emailTemplate(user.name, subscriptions);
            
            await sendEmail(
                user.email,
                'Subscription Payment Reminder',
                'You have upcoming subscription payments. Please check the details in this email.',
                emailHtml
            );
            
            console.log(`Reminder email sent to ${user.email} for ${subscriptions.length} subscriptions`);
        }

        return updatedSubscriptions;
    } catch (error) {
        console.error('Error in checkAndSendReminders:', error);
        throw error;
    }
}

module.exports = {
    checkAndSendReminders,
    SUBSCRIPTION_STATUS
};