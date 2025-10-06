// controllers/dataController.js
const Upload = require("../models/Upload");

// GET /api/uploads/content/:id
exports.getParsedContent = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }
    res.json(upload.content); // Only return the parsed content array
  } catch (err) {
    console.error("Error fetching content:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
