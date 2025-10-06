const Upload = require("../models/Upload");
const History = require("../models/History");
const mongoose = require("mongoose");

// 🔹 GET user's uploads
exports.getUserUploads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { sort = 'uploadedAt', order = 'desc', search, from, to, chartType } = req.query;

    const filter = { "uploadedBy.id": req.user._id };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (from || to) {
      filter.uploadedAt = {};
      if (from) filter.uploadedAt.$gte = new Date(from);
      if (to) filter.uploadedAt.$lte = new Date(to);
    }

    // Optional filter by chartType: include uploads that have recorded this chartType in history
    if (chartType && chartType !== 'All') {
      const ids = await History.aggregate([
        { $match: { userId: req.user._id, action: 'chart_generated', chartType } },
        { $group: { _id: '$uploadId' } },
        { $project: { _id: 0, uploadId: '$_id' } }
      ]);
      const allowed = ids.map(d => d.uploadId);
      if (allowed.length === 0) {
        return res.json({ uploads: [], total: 0, page, totalPages: 0 });
      }
      filter._id = { $in: allowed };
    }

    const sortMap = { uploadedAt: 'uploadedAt', name: 'name', size: 'size' };
    const sortField = sortMap[sort] || 'uploadedAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const [uploads, total] = await Promise.all([
      Upload.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      Upload.countDocuments(filter)
    ]);

    res.json({
      uploads,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('getUserUploads error', err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 GET all uploads (admin only)
exports.getAllUploads = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const uploads = await Upload.find().sort({ uploadedAt: -1 });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 GET raw content by upload ID
exports.getUploadContent = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ message: "Upload not found" });

    res.json(upload.content || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Create new upload
exports.createUpload = async (req, res) => {
  const { name, size, content } = req.body;
  const { _id, name: userName, email } = req.user;

  try {
    const newUpload = new Upload({
      name,
      size,
      originalContent: content,
      content,
      uploadedBy: { id: _id, name: userName, email },
    });

    await newUpload.save();

    // Emit to user and admins
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${_id}`).emit('uploads:added', { upload: newUpload });
      io.to('admins').emit('uploads:added', { upload: newUpload });
    }

    res.status(201).json({ message: "Upload recorded successfully", upload: newUpload });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server Error" });
  }
};

// 🔹 Preview cleaned content
exports.getCleanedContent = async (req, res) => {
  const upload = await Upload.findById(req.params.id);
  if (!upload) return res.status(404).json({ message: "Not found" });

  res.json(upload.cleanedContent || []);
};

// 🔹 Clean content in-place
exports.cleanUploadContent = async (req, res) => {
  const { id } = req.params;

  const upload = await Upload.findById(id);
  if (!upload) return res.status(404).json({ message: "Upload not found" });

  // Trim strings, then remove rows where all fields are empty after trimming
  const cleanedContent = (upload.content || [])
    .map((row) => {
      const cleanedRow = {};
      for (const key in row) {
        if (typeof row[key] === "string") {
          cleanedRow[key] = row[key].trim();
        } else {
          cleanedRow[key] = row[key];
        }
      }
      return cleanedRow;
    })
    .filter((row) => Object.values(row).some((val) => val !== null && val !== ""));

  upload.cleanedContent = cleanedContent;
  await upload.save();

  // Emit cleaned event
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${upload.uploadedBy.id}`).emit('uploads:cleaned', { uploadId: upload._id });
    io.to('admins').emit('uploads:cleaned', { uploadId: upload._id });
  }

  res.json({ message: "Content cleaned", cleanedContent });
};

// ✅ 🔹 Save Edited / Cleaned Data (NEW)
exports.saveCleanedContent = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ message: "Upload not found" });

    upload.cleanedContent = content;
    await upload.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${upload.uploadedBy.id}`).emit('uploads:updated', { uploadId: upload._id });
    }

    res.json({ message: "Cleaned content saved", cleanedContent: upload.cleanedContent });
  } catch (err) {
    console.error("Error saving cleaned content", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ PUT /api/uploads/:id — Update cleaned data from frontend
exports.updateUploadContent = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ message: "Upload not found" });

    upload.content = content;
    await upload.save();

    res.json({ message: "Content updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Add at the bottom of uploadController.js
exports.deleteSelectedRows = async (req, res) => {
  const { id } = req.params;
  const { rowsToDelete } = req.body;

  const upload = await Upload.findById(id);
  if (!upload) return res.status(404).json({ message: "Upload not found" });

  const updatedContent = upload.content.filter((_, index) => !rowsToDelete.includes(index));

  upload.content = updatedContent;
  await upload.save();

  res.json({ message: "Selected rows deleted successfully" });
};

// 🔹 Get original content
exports.getOriginalContent = async (req, res) => {
  const upload = await Upload.findById(req.params.id);
  if (!upload) return res.status(404).json({ message: "Upload not found" });
  res.json(upload.originalContent);
};

// Admin: Get uploads for a specific user by userId
exports.getUploadsByUserId = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { userId } = req.params;
    const uploads = await Upload.find({ "uploadedBy.id": userId }).sort({ uploadedAt: -1 });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


