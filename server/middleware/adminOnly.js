module.exports = function adminOnly(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (e) {
    return res.status(403).json({ message: 'Admin access required' });
  }
};

