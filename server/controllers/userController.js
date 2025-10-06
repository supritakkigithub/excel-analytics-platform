// controllers/userController.js
const User = require("../models/user");
const ResetToken = require("../models/ResetToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const History = require("../models/History");

// User: Update profile
exports.updateProfile = async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all users (with filters and pagination)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, role, status, sort = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
    if (role && ['user','admin'].includes(role)) filter.role = role;
    if (status && ['active','blocked'].includes(status)) filter.status = status;

    const sortMap = { createdAt: 'createdAt', name: 'name', email: 'email' };
    const sortField = sortMap[sort] || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter, 'name email role status createdAt updatedAt')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update user info
exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name && !email && !role) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    await user.save();

    // Emit admin update
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('users:updated', { id: user._id, role: user.role, name: user.name, email: user.email, status: user.status });
      io.to(`user:${user._id}`).emit('users:self-updated', { role: user.role, name: user.name });
    }

    res.json({
      message: 'User updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Block/Unblock user
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();

    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('users:status', { id: user._id, status: user.status });
      io.to(`user:${user._id}`).emit('users:self-status', { status: user.status });
    }

    res.json({
      message: `User ${user.status === 'active' ? 'unblocked' : 'blocked'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const io = req.app.get('io');
    if (io) io.to('admins').emit('users:deleted', { id });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Trigger password reset email for a user
exports.adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await ResetToken.deleteMany({ userId: user._id });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = Date.now() + 1000 * 60 * 15;

    await ResetToken.create({ userId: user._id, token: hashedToken, expiresAt: expires });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    await sendEmail(user.email, "Reset your password", `Click here to reset your password: ${resetURL}`);

    const io = req.app.get('io');
    if (io) io.to('admins').emit('users:reset-sent', { id: user._id });

    res.json({ message: "Reset link sent to user's email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get analysis history for a specific user by userId
exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await History.find({ userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
