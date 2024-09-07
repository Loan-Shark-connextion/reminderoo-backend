const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

// Create a new subscription
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      appName,
      category,
      pricing,
      startPayment,
      cycle,
      paymentMethod,
      intervalDays, // New field for reminder preference
      email,
      icon,
    } = req.body;

    // Validate input
    if (
      !appName ||
      !category ||
      !pricing ||
      !startPayment ||
      !cycle ||
      !paymentMethod ||
      !intervalDays ||
      !email
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Calculate next payment date based on cycle
    const nextPayment = calculateNextPayment(new Date(startPayment), cycle);

    const [result] = await pool.query(
      "INSERT INTO subscriptions (user_id, app_name, category, pricing, start_payment, next_payment, status, cycle, payment_method, interval_days, email, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        req.user.userId,
        appName,
        category,
        pricing,
        startPayment,
        nextPayment,
        "active",
        cycle,
        paymentMethod,
        intervalDays,
        email,
        icon,
      ]
    );

    res
      .status(201)
      .json({
        message: "Subscription created successfully",
        subscriptionId: result.insertId,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the subscription" });
  }
});

// Get all subscriptions for a user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM subscriptions WHERE user_id = ?",
      [req.user.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching subscriptions" });
  }
});

// Get a specific subscription
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM subscriptions WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the subscription" });
  }
});

// Update a subscription
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      appName,
      category,
      pricing,
      startPayment,
      cycle,
      paymentMethod,
      intervalDays,
      email,
      icon,
    } = req.body;

    // Validate input
    if (
      !appName ||
      !category ||
      !pricing ||
      !startPayment ||
      !cycle ||
      !paymentMethod ||
      !intervalDays ||
      !email ||
      !icon
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const nextPayment = calculateNextPayment(new Date(startPayment), cycle);

    const [result] = await pool.query(
      "UPDATE subscriptions SET app_name = ?, category = ?, pricing = ?, start_payment = ?, next_payment = ?, cycle = ?, payment_method = ?, interval_days = ?, email = ?, icon = ? WHERE id = ? AND user_id = ?",
      [
        appName,
        category,
        pricing,
        startPayment,
        nextPayment,
        cycle,
        paymentMethod,
        intervalDays,
        email,
        icon,
        req.params.id,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({ message: "Subscription updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the subscription" });
  }
});

// Delete a subscription
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM subscriptions WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the subscription" });
  }
});

// Helper function to calculate next payment date
function calculateNextPayment(startDate, cycle) {
  let nextPayment = new Date(startDate);
  switch (cycle) {
    case "daily":
      nextPayment.setDate(nextPayment.getDate() + 1);
      break;
    case "weekly":
      nextPayment.setDate(nextPayment.getDate() + 7);
      break;
    case "monthly":
      nextPayment.setMonth(nextPayment.getMonth() + 1);
      break;
    case "3 months":
      nextPayment.setMonth(nextPayment.getMonth() + 3);
      break;
    case "6 months":
      nextPayment.setMonth(nextPayment.getMonth() + 6);
      break;
    case "yearly":
      nextPayment.setFullYear(nextPayment.getFullYear() + 1);
      break;
  }
  return nextPayment;
}

module.exports = router;
