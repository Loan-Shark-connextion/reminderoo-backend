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

router.get('/cost', authenticateToken, async (req, res) => {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        // Query for year data
        const { data: yearData, error: yearError } = await supabase
            .from('transactions')
            .select(`
                pricing,
                subscriptions!inner(
                    user_id,
                    app_name
                )
            `)
            .eq('subscriptions.user_id', req.user.userId)
            .gte('payment_date', `${currentYear}-01-01`)
            .lte('payment_date', `${currentYear}-12-31`);

        if (yearError) throw yearError;

        // Query for month data
        const { data: monthData, error: monthError } = await supabase
            .from('transactions')
            .select(`
                pricing,
                subscriptions!inner(
                    user_id,
                    app_name
                )
            `)
            .eq('subscriptions.user_id', req.user.userId)
            .gte('payment_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
            .lte('payment_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`);

        if (monthError) throw monthError;

        // Query for total active subscriptions
        const { data: totalSubscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', req.user.userId)
            .eq('is_deleted', false)
            .in('status', ['active', 'upcoming']);

        if (subError) throw subError;

        // Process year data
        const yearApps = {};
        yearData.forEach(transaction => {
            const appName = transaction.subscriptions.app_name;
            yearApps[appName] = (yearApps[appName] || 0) + parseInt(transaction.pricing);
        });

        // Process month data
        const monthApps = {};
        monthData.forEach(transaction => {
            const appName = transaction.subscriptions.app_name;
            monthApps[appName] = (monthApps[appName] || 0) + parseInt(transaction.pricing);
        });

        // Format response
        const response = {
            totals: [
                { sortedBy: "year", count: totalSubscriptions.length },
                { sortedBy: "month", count: totalSubscriptions.length }
            ],
            topApps: [
                ...Object.entries(yearApps)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([appName, cost]) => ({
                        sortedBy: "year",
                        appName,
                        cost
                    })),
                ...Object.entries(monthApps)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([appName, cost]) => ({
                        sortedBy: "month",
                        appName,
                        cost
                    }))
            ]
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching cost chart data' });
    }
});

module.exports = router;