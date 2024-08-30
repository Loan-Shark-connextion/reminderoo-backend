const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const pool = require("../db");

class User {
  static async create(username, name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)",
      [username, name, email, hashedPassword]
    );
    const defaultProfilePicture = `../public/images/default_profiles/default_${
      Math.floor(Math.random() * 5) + 1
    }.jpg`;
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    return rows[0];
  }

  static async updateProfilePicture(userId, profilePicture) {
    await pool.query("UPDATE users SET profile_picture = ? WHERE id = ?", [
      profilePicture,
      userId,
    ]);
  }

  static async findById(userId) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    return rows[0];
  }

  static async updateProfile(userId, { name, email, phoneNumber }) {
    await pool.query(
      "UPDATE users SET name = ?, email = ?, phone_number = ? WHERE id = ?",
      [name, email, phoneNumber, userId]
    );
    return this.findById(userId);
  }

  static async updatePassword(userId, newHashedPassword) {
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      newHashedPassword,
      userId,
    ]);
  }
}

module.exports = User;
