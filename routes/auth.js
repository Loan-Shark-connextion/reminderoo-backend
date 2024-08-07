const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, firstName, lastName, email, password } = req.body;

      // Validation
        if (!username || !firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

      // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const userId = await User.create(username, firstName, lastName, email, password);
        console.log('Sending response:', { message: 'User registered successfully', userId });
        res.status(201).json({ message: 'User registered successfully', userId });
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Stack trace:', error.stack);
            res.status(500).json({ message: 'An error occurred during registration', error: error.message, stack: error.stack });
        }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set cookie
        res.cookie('token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', // use secure cookies in production
        maxAge: 3600000 // 1 hour
        });

        res.json({ message: 'Login successful', user: { id: user.id, email: user.email, username: user.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

router.get('/protected-route', authenticateToken, (req, res) => {
    // This route is now protected
    res.json({ message: 'This is a protected route', userId: req.user.userId });
    });

router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'You accessed a protected route', user: req.user });
    });

module.exports = router;