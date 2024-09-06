const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { checkAndSendReminders } = require('../services/notificationService');

router.post('/trigger-reminders', authenticateToken, async (req, res) => {
    try {
        await checkAndSendReminders();
        res.json({ message: 'Reminder check triggered successfully' });
    } catch (error) {
        console.error('Error triggering reminder check:', error);
        res.status(500).json({ message: 'Error triggering reminder check', error: error.message });
    }
});