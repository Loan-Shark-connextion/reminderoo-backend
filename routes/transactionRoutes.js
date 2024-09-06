const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Create a new transaction
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            subscriptionId, 
            pricing, 
            status, 
            paymentMethod, 
            paymentDate,
            appName,
            icon,
            category
        } = req.body;

        // Validate input
        if (!subscriptionId || !pricing || !status || !paymentMethod || !paymentDate || !appName || !icon || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO transactions (subscription_id, pricing, status, payment_method, payment_date, appName, icon, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [subscriptionId, pricing, status, paymentMethod, paymentDate, appName, icon, category]
        );

        res.status(201).json({ message: 'Transaction created successfully', transactionId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the transaction' });
    }
});

// Get all transactions for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT t.* FROM transactions t JOIN subscriptions s ON t.subscription_id = s.id WHERE s.user_id = ?', 
            [req.user.userId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching transactions' });
    }
});

// Get a specific transaction
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT t.* FROM transactions t JOIN subscriptions s ON t.subscription_id = s.id WHERE t.id = ? AND s.user_id = ?', 
            [req.params.id, req.user.userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the transaction' });
    }
});

router.get('/:id/transactions', authenticateToken, async (req, res) => {
    try {
        const subscriptionId = req.params.id;
        const userId = req.user.userId;

        // First, verify that the subscription belongs to the authenticated user
        const [subscription] = await pool.query('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?', [subscriptionId, userId]);

        if (subscription.length === 0) {
            return res.status(404).json({ message: 'Subscription not found or does not belong to the user' });
        }

        // Fetch all transactions for the subscription
        const [transactions] = await pool.query('SELECT * FROM transactions WHERE subscription_id = ?', [subscriptionId]);

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching transaction data' });
    }
});

// Update a transaction
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { 
            pricing, 
            status, 
            paymentMethod, 
            paymentDate,
            appName,
            icon,
            category 
        } = req.body;

        // Validate input
        if (!pricing || !status || !paymentMethod || !paymentDate || !appName || !icon || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await pool.query(
            'UPDATE transactions t JOIN subscriptions s ON t.subscription_id = s.id SET t.pricing = ?, t.status = ?, t.payment_method = ?, t.payment_date = ? t.appName = ?, t.icon = ?, t.category = ? WHERE t.id = ? AND s.user_id = ?',
            [pricing, status, paymentMethod, paymentDate, req.params.id, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the transaction' });
    }
});

// Delete a transaction
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE t FROM transactions t JOIN subscriptions s ON t.subscription_id = s.id WHERE t.id = ? AND s.user_id = ?', 
            [req.params.id, req.user.userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the transaction' });
    }
});

module.exports = router;