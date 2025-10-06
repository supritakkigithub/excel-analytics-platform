const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const ResetToken = require("../models/ResetToken");
const sendEmail = require("../utils/sendEmail");

// Register User
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashed, role });
    await newUser.save();

    res.status(201).json({ msg: "Registration successful" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // ✅ Store userId in token to match middleware
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

//Controller to Handle Reset Logic
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 1000 * 60 * 15; // 15 min
    await ResetToken.create({ userId: user._id, token, expiresAt: expires });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail(email, "Reset your password", `Click here: ${resetURL}`);

    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const record = await ResetToken.findOne({ token });
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    const user = await User.findById(record.userId);
    user.password = password; // password will be hashed via user model pre-save
    await user.save();

    await ResetToken.deleteOne({ _id: record._id });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
