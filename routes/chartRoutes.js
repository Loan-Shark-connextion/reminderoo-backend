const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Get spending chart data
router.get('/spending', authenticateToken, async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;

        // Query to get monthly totals for current and last year
        const [rows] = await pool.query(`
            SELECT 
                YEAR(t.payment_date) AS year,
                MONTH(t.payment_date) AS month,
                SUM(t.pricing) AS total
            FROM 
                transactions t
            JOIN 
                subscriptions s ON t.subscription_id = s.id
            WHERE 
                s.user_id = ? AND YEAR(t.payment_date) IN (?, ?)
            GROUP BY 
                YEAR(t.payment_date), MONTH(t.payment_date)
            ORDER BY 
                YEAR(t.payment_date), MONTH(t.payment_date)
        `, [req.user.userId, lastYear, currentYear]);

        // Process the data into the required format
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const chartData = monthNames.map(month => ({
            month,
            [lastYear]: 0,
            [currentYear]: 0
        }));

        rows.forEach(row => {
            const monthIndex = row.month - 1;
            chartData[monthIndex][row.year] = parseInt(row.total);
        });

        // Calculate totals
        const totals = [
            { year: lastYear, total: parseInt(rows.filter(r => r.year === lastYear).reduce((sum, r) => sum + parseInt(r.total), 0)) },
            { year: currentYear, total: parseInt(rows.filter(r => r.year === currentYear).reduce((sum, r) => sum + parseInt(r.total), 0)) }
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

        // Query to get top 5 apps by total cost for the current year and current month
        const [rows] = await pool.query(`
            SELECT 
                s.app_name,
                SUM(t.pricing) AS total_cost,
                'year' AS sortedBy
            FROM 
                transactions t
            JOIN 
                subscriptions s ON t.subscription_id = s.id
            WHERE 
                s.user_id = ? AND YEAR(t.payment_date) = ?
            GROUP BY 
                s.app_name
            UNION ALL
            SELECT 
                s.app_name,
                SUM(t.pricing) AS total_cost,
                'month' AS sortedBy
            FROM 
                transactions t
            JOIN 
                subscriptions s ON t.subscription_id = s.id
            WHERE 
                s.user_id = ? AND YEAR(t.payment_date) = ? AND MONTH(t.payment_date) = ?
            GROUP BY 
                s.app_name
            ORDER BY 
                sortedBy DESC, total_cost DESC
        `, [req.user.userId, currentYear, req.user.userId, currentYear, currentMonth]);

        // Calculate total active subscriptions for year and month based on next_payment
        const [totalSubscriptions] = await pool.query(`
            SELECT 
                COUNT(DISTINCT CASE WHEN YEAR(next_payment) = ? THEN id END) AS year_count,
                COUNT(DISTINCT CASE WHEN YEAR(next_payment) = ? AND MONTH(next_payment) = ? THEN id END) AS month_count
            FROM 
                subscriptions
            WHERE 
                user_id = ? AND is_deleted = FALSE
        `, [currentYear, currentYear, currentMonth, req.user.userId]);

        const yearData = rows.filter(row => row.sortedBy === 'year').slice(0, 5);
        const monthData = rows.filter(row => row.sortedBy === 'month').slice(0, 5);

        const response = {
            totals: [
                { sortedBy: "year", count: parseInt(totalSubscriptions[0].year_count) },
                { sortedBy: "month", count: parseInt(totalSubscriptions[0].month_count) }
            ],
            topApps: [
                ...yearData.map(row => ({
                    sortedBy: "year",
                    appName: row.app_name,
                    cost: parseInt(row.total_cost)
                })),
                ...monthData.map(row => ({
                    sortedBy: "month",
                    appName: row.app_name,
                    cost: parseInt(row.total_cost)
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