const express = require('express');
const router = express.Router();
const supabase = require('../db');
const authenticateToken = require('../middleware/auth');

// Create a new subscription
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            appName, 
            category, 
            pricing, 
            startPayment, 
            nextPayment,
            status,
            cycle, 
            paymentMethod, 
            intervalDays,
            email,
            icon 
        } = req.body;

        if (!appName || !category || !pricing || !startPayment || !nextPayment || !status || !cycle || !paymentMethod || !intervalDays || !email || !icon) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{
                user_id: req.user.userId,
                app_name: appName,
                category,
                pricing,
                start_payment: startPayment,
                next_payment: nextPayment,
                status,
                cycle,
                payment_method: paymentMethod,
                interval_days: intervalDays,
                email,
                icon
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Subscription created successfully', subscriptionId: data.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the subscription' });
    }
});

// Get all subscriptions for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', req.user.userId)
            .eq('is_deleted', false);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching subscriptions' });
    }
});

// Get a specific subscription
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId)
            .eq('is_deleted', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Subscription not found' });
            }
            throw error;
        }
        res.json(data);
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
            nextPayment,
            status,
            cycle, 
            paymentMethod, 
            intervalDays,
            email,
            icon 
        } = req.body;

        if (!appName || !category || !pricing || !startPayment || !nextPayment || !status || !cycle || !paymentMethod || !intervalDays || !email || !icon) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .update({
                app_name: appName,
                category,
                pricing,
                start_payment: startPayment,
                next_payment: nextPayment,
                status,
                cycle,
                payment_method: paymentMethod,
                interval_days: intervalDays,
                email,
                icon
            })
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Subscription not found' });
            }
            throw error;
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
        const { error } = await supabase
            .from('subscriptions')
            .update({ is_deleted: true })
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId);

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Subscription not found' });
            }
            throw error;
        }
        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the subscription' });
    }
});

module.exports = router;