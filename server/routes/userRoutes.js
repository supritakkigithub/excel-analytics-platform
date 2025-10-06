// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const { validateGetAllUsers, validateUpdateUser } = require("../middleware/validate");
const { updateProfile, getAllUsers, adminUpdateUser, toggleUserStatus, deleteUser, adminResetPassword, getUserHistory } = require("../controllers/userController");

router.put("/update", authenticate, updateProfile);
router.get("/all", authenticate, adminOnly, validateGetAllUsers, getAllUsers); // Admin: get all users
router.put("/:id", authenticate, adminOnly, validateUpdateUser, adminUpdateUser); // Admin: update user info
router.patch("/:id/status", authenticate, adminOnly, toggleUserStatus); // Admin: block/unblock user

// Admin: delete user
router.delete('/:id', authenticate, adminOnly, deleteUser);

// Admin: trigger password reset for user
router.post('/:id/reset-password', authenticate, adminOnly, adminResetPassword);

// Admin: Get analysis history for a specific user by userId
router.get('/:userId/history', authenticate, adminOnly, getUserHistory);

module.exports = router;
