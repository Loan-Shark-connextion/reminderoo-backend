const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

// Get spending chart data
router.get('/spending', authenticateToken, async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;

        const { data: rows, error } = await supabase
            .from('transactions')
            .select(`
                pricing,
                payment_date,
                subscriptions!inner(user_id)
            `)
            .eq('subscriptions.user_id', req.user.userId)
            .gte('payment_date', `${lastYear}-01-01`)
            .lte('payment_date', `${currentYear}-12-31`);

        if (error) throw error;

        // Process the data into the required format
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const chartData = monthNames.map(month => ({
            month,
            [lastYear]: 0,
            [currentYear]: 0
        }));

        rows.forEach(row => {
            const date = new Date(row.payment_date);
            const year = date.getFullYear();
            const monthIndex = date.getMonth();
            chartData[monthIndex][year] = (chartData[monthIndex][year] || 0) + parseInt(row.pricing);
        });

        // Calculate totals
        const totals = [
            { 
                year: lastYear, 
                total: rows.filter(r => new Date(r.payment_date).getFullYear() === lastYear)
                    .reduce((sum, r) => sum + parseInt(r.pricing), 0)
            },
            {
                year: currentYear,
                total: rows.filter(r => new Date(r.payment_date).getFullYear() === currentYear)
                    .reduce((sum, r) => sum + parseInt(r.pricing), 0)
            }
        ];

        res.json({ chartData, totals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching spending chart data' });
    }
});