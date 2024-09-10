const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Create a new subscription
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            appName, 
            category, 
            pricing, 
            startPayment, 
            nextPayment,  // New field
            status,       // New field
            cycle, 
            paymentMethod, 
            intervalDays,
            email,
            icon 
        } = req.body;

        // Validate input
        if (!appName || !category || !pricing || !startPayment || !nextPayment || !status || !cycle || !paymentMethod || !intervalDays || !email || !icon) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO subscriptions (user_id, app_name, category, pricing, start_payment, next_payment, status, cycle, payment_method, interval_days, email, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.userId, appName, category, pricing, startPayment, nextPayment, status, cycle, paymentMethod, intervalDays, email, icon]
        );

        res.status(201).json({ message: 'Subscription created successfully', subscriptionId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the subscription' });
    }
});

// Get all subscriptions for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM subscriptions WHERE user_id = ?', [req.user.userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching subscriptions' });
    }
});

// Get a specific subscription
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the subscription' });
    }
});

// Update a subscription
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { 
            appName, 
            category, 
            pricing, 
            startPayment, 
            nextPayment,  // New field
            status,       // New field
            cycle, 
            paymentMethod, 
            intervalDays,
            email,
            icon 
        } = req.body;

        // Validate input
        if (!appName || !category || !pricing || !startPayment || !nextPayment || !status || !cycle || !paymentMethod || !intervalDays || !email || !icon) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await pool.query(
            'UPDATE subscriptions SET app_name = ?, category = ?, pricing = ?, start_payment = ?, next_payment = ?, status = ?, cycle = ?, payment_method = ?, interval_days = ?, email = ?, icon = ? WHERE id = ? AND user_id = ?',
            [appName, category, pricing, startPayment, nextPayment, status, cycle, paymentMethod, intervalDays, email, icon, req.params.id, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        res.json({ message: 'Subscription updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the subscription' });
    }
});

// Delete a subscription
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM subscriptions WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the subscription' });
    }
});

module.exports = router;