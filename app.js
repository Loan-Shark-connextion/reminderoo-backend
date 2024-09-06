const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const cron = require('node-cron');
const { checkAndSendReminders } = require('./services/notificationService');
const reminderRoutes = require('./routes/reminderRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes)
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reminders', reminderRoutes);

app.get('/', (req, res) => {
    res.send('Reminderoo API');
});

// Schedule the reminder check to run every day at midnight
    cron.schedule('0 0 * * *', () => {
    console.log('Running subscription reminder check');
    checkAndSendReminders();
    });

app.listen(port, () => {
    console.log(`Reminderoo server running on port ${port}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});