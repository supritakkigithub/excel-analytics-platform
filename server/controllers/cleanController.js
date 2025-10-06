// controllers/cleanController.js
const Upload = require("../models/Upload");

exports.cleanUploadData = async (req, res) => {
  const { id } = req.params;

  try {
    const upload = await Upload.findById(id);
    if (!upload || !upload.content) {
      return res.status(404).json({ message: "Upload not found or no content." });
    }

    const cleaned = upload.content.filter((row) => {
      return Object.values(row).some((val) => val !== null && val !== "");
    });

    upload.content = cleaned;
    await upload.save();

    res.json({ message: "Data cleaned successfully", cleanedCount: cleaned.length });
  } catch (err) {
    console.error("Clean error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
