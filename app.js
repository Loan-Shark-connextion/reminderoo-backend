const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const cron = require('node-cron');
const { checkAndSendReminders } = require('./services/notificationService');
const reminderRoutes = require('./routes/reminderRoutes');
const chartRoutes = require('./routes/chartRoutes');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use((cors()));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Add Supabase error handling middleware
app.use((err, req, res, next) => {
    if (err.statusCode === 400 && err.message.includes('JWT')) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    next(err);
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes)
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/charts', chartRoutes);

app.get('/', (req, res) => {
    res.send('Reminderoo API');
});

cron.schedule('0 0 * * *', () => {
    console.log('Running subscription reminder check');
    checkAndSendReminders();
});

app.listen(port, () => {
    console.log(`Reminderoo server running on port ${port}`);
});

// Update error handling middleware to handle Supabase errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
    } else {
        res.status(500).json({ message: "Something went wrong!" });
    }
});