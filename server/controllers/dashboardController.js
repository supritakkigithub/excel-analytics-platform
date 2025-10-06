const User = require('../models/user');
const Upload = require('../models/Upload');
const History = require('../models/History');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalUploads = await Upload.countDocuments();
    const totalHistory = await History.countDocuments();
    res.json({ totalUsers, totalUploads, totalHistory });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

exports.getDashboardMetrics = async (req, res) => {
  try {
    const range = parseInt((req.query.range || '30').replace(/[^0-9]/g, ''), 10) || 30;
    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

    // uploads by day
    const uploadsByDay = await Upload.aggregate([
      { $match: { uploadedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$uploadedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', _id: 0, count: 1 } }
    ]);

    // active users by day (users who generated any history that day)
    const activeUsersByDay = await History.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, users: { $addToSet: '$userId' } } },
      { $project: { date: '$_id', _id: 0, count: { $size: '$users' } } },
      { $sort: { date: 1 } }
    ]);

    // chart type distribution over range
    const chartAgg = await History.aggregate([
      { $match: { createdAt: { $gte: since }, action: 'chart_generated' } },
      { $group: { _id: '$chartType', count: { $sum: 1 } } },
      { $project: { _id: 0, chartType: '$_id', count: 1 } }
    ]);
    const chartTypeCounts = chartAgg.reduce((acc, cur) => { acc[cur.chartType || 'Unknown'] = cur.count; return acc; }, {});

    res.json({ uploadsByDay, activeUsersByDay, chartTypeCounts, since });
  } catch (err) {
    console.error('metrics error', err);
    res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
  }
}; 