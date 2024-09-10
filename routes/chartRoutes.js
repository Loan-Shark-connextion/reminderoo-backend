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
            chartData[monthIndex][row.year] = row.total;
        });

        // Calculate totals
        const totals = [
            { year: lastYear, total: rows.filter(r => r.year === lastYear).reduce((sum, r) => sum + r.total, 0) },
            { year: currentYear, total: rows.filter(r => r.year === currentYear).reduce((sum, r) => sum + r.total, 0) }
        ];

        res.json({ chartData, totals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching spending chart data' });
    }
});

// Get cost chart data
router.get('/cost', authenticateToken, async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        // Query to get top 5 apps by total cost for the current year
        const [rows] = await pool.query(`
            SELECT 
                s.app_name,
                SUM(t.pricing) AS total_cost
            FROM 
                transactions t
            JOIN 
                subscriptions s ON t.subscription_id = s.id
            WHERE 
                s.user_id = ? AND YEAR(t.payment_date) = ?
            GROUP BY 
                s.app_name
            ORDER BY 
                total_cost DESC
            LIMIT 5
        `, [req.user.userId, currentYear]);

        // Calculate total subscriptions
        const [totalSubscriptions] = await pool.query(`
            SELECT COUNT(DISTINCT id) AS total
            FROM subscriptions
            WHERE user_id = ?
        `, [req.user.userId]);

        const chartData = rows.map(row => ({
            app: row.app_name,
            cost: row.total_cost,
            category: 'Unknown' // You might want to add category to your subscriptions table if needed
        }));

        res.json({ 
            chartData, 
            totalSubscriptions: totalSubscriptions[0].total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching cost chart data' });
    }
});

module.exports = router;