const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');
const { validateHistoryLatest } = require('../middleware/validate');
const History = require('../models/History');

// Log a new history record
router.post('/', authenticate, async (req, res) => {
  try {
    const { uploadId, action, chartType } = req.body;
    const userId = req.user._id;
    const history = new History({ userId, uploadId, action, chartType });
    await history.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('history:added', { uploadId, action, chartType, createdAt: history.createdAt });
      io.to('admins').emit('history:added', { userId, uploadId, action, chartType, createdAt: history.createdAt });
    }

    res.status(201).json({ message: 'History logged', history });
  } catch (err) {
    res.status(500).json({ message: 'Failed to log history' });
  }
});

// GET /api/history?uploadId=... - fetch history for a specific upload for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const { uploadId } = req.query;
    if (!uploadId) return res.status(400).json({ message: 'uploadId is required' });
    const userId = req.user._id;
    const history = await History.find({ userId, uploadId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

// GET /api/history/latest?uploadIds=1,2,3 – batched latest chart type for user
router.get('/latest', authenticate, validateHistoryLatest, async (req, res) => {
  try {
    const { uploadIds } = req.query;
    const ids = uploadIds.split(',').filter(Boolean);
    const userId = req.user._id;

    const latest = await History.aggregate([
      { $match: { userId, uploadId: { $in: ids.map(id => require('mongoose').Types.ObjectId(id)) }, action: 'chart_generated' } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$uploadId', chartType: { $first: '$chartType' }, createdAt: { $first: '$createdAt' } } },
      { $project: { _id: 0, uploadId: '$_id', chartType: 1, createdAt: 1 } }
    ]);

    res.json(latest);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch latest history' });
  }
});

module.exports = router; 