// test-notification.js
const { checkAndSendReminders } = require('./services/notificationService');

async function testNotificationService() {
    try {
        const updatedSubscriptions = await checkAndSendReminders();
        console.log('Updated subscriptions:', updatedSubscriptions);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testNotificationService();