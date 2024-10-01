const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
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

        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                subscription_id: subscriptionId,
                pricing,
                status,
                payment_method: paymentMethod,
                payment_date: paymentDate,
                app_name: appName,
                icon,
                category
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Transaction created successfully', transactionId: data.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the transaction' });
    }
});

// Get all transactions for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                subscriptions!inner(user_id)
            `)
            .eq('subscriptions.user_id', req.user.userId);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching transactions' });
    }
});

// Get transactions for a specific subscription
router.get('/:id/transactions', authenticateToken, async (req, res) => {
    try {
        const subscriptionId = req.params.id;

        // First, verify that the subscription belongs to the authenticated user
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .eq('user_id', req.user.userId)
            .single();

        if (subError || !subscription) {
            return res.status(404).json({ message: 'Subscription not found or does not belong to the user' });
        }

        // Fetch all transactions for the subscription
        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .eq('subscription_id', subscriptionId)
            .order('payment_date', { ascending: false });

        if (transError) throw transError;

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

        const { data, error } = await supabase
            .from('transactions')
            .update({
                pricing,
                status,
                payment_method: paymentMethod,
                payment_date: paymentDate,
                app_name: appName,
                icon,
                category
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
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
        const { data, error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the transaction' });
    }
});

module.exports = router;