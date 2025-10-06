function isOneOf(value, list) {
  return list.includes(value);
}

exports.validateGetAllUsers = (req, res, next) => {
  const { page, limit, sort, order, role, status } = req.query;
  if (page && isNaN(parseInt(page))) return res.status(400).json({ message: 'Invalid page' });
  if (limit && isNaN(parseInt(limit))) return res.status(400).json({ message: 'Invalid limit' });
  if (sort && !isOneOf(sort, ['createdAt','name','email'])) return res.status(400).json({ message: 'Invalid sort' });
  if (order && !isOneOf(order, ['asc','desc'])) return res.status(400).json({ message: 'Invalid order' });
  if (role && !isOneOf(role, ['user','admin'])) return res.status(400).json({ message: 'Invalid role' });
  if (status && !isOneOf(status, ['active','blocked'])) return res.status(400).json({ message: 'Invalid status' });
  next();
};

exports.validateUpdateUser = (req, res, next) => {
  const { name, email, role } = req.body || {};
  if (!name && !email && !role) return res.status(400).json({ message: 'No fields provided to update' });
  if (role && !isOneOf(role, ['user','admin'])) return res.status(400).json({ message: 'Invalid role' });
  next();
};

exports.validateUploadsList = (req, res, next) => {
  const { page, limit, sort, order, chartType, from, to } = req.query;
  if (page && isNaN(parseInt(page))) return res.status(400).json({ message: 'Invalid page' });
  if (limit && isNaN(parseInt(limit))) return res.status(400).json({ message: 'Invalid limit' });
  if (sort && !isOneOf(sort, ['uploadedAt','name','size'])) return res.status(400).json({ message: 'Invalid sort' });
  if (order && !isOneOf(order, ['asc','desc'])) return res.status(400).json({ message: 'Invalid order' });
  if (chartType && chartType !== 'All' && typeof chartType !== 'string') return res.status(400).json({ message: 'Invalid chartType' });
  if (from && isNaN(Date.parse(from))) return res.status(400).json({ message: 'Invalid from date' });
  if (to && isNaN(Date.parse(to))) return res.status(400).json({ message: 'Invalid to date' });
  next();
};

exports.validateHistoryLatest = (req, res, next) => {
  const { uploadIds } = req.query;
  if (!uploadIds) return res.status(400).json({ message: 'uploadIds is required' });
  const ids = String(uploadIds).split(',').filter(Boolean);
  if (ids.length === 0) return res.status(400).json({ message: 'uploadIds cannot be empty' });
  next();
};

