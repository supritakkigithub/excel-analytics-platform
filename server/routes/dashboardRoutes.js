const express = require('express');
const router = express.Router();
const { getDashboardStats, getDashboardMetrics } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/stats', authenticate, getDashboardStats);
router.get('/metrics', authenticate, getDashboardMetrics);

module.exports = router; 