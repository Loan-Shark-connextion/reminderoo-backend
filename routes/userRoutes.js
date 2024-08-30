const express = require("express");
const User = require("../models/user");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");

const storage = multer.diskStorage({});

router.put("/update-phone", authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    await User.updatePhoneNumber(req.user.userId, phoneNumber);
    res.json({ message: "Phone number updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating phone number", error: error.message });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
});

// Update user profile
router.put("/update-profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const updatedUser = await User.updateProfile(req.user.userId, {
      name,
      email,
      phoneNumber,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phone_number,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }

  router.put("/change-password", authenticateToken, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Validate input
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Old password and new password are required" });
      }

      // Fetch user from database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password
      );
      if (!isOldPasswordValid) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      await User.updatePassword(userId, hashedNewPassword);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error changing password", error: error.message });
    }
  });
});

module.exports = router;
