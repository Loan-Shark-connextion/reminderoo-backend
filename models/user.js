const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const pool = require('../db');

class User {
    static async create(username, firstName, lastName, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
        'INSERT INTO users (username, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)',
        [username, firstName, lastName, email, hashedPassword]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }
}

module.exports = User;