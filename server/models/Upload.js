const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  name: String,
  size: Number,
  originalContent: { type: Array, default: [] }, // 🆕 original untouched data
  content: { type: Array, default: [] },         // cleaned/edited data
  uploadedBy: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Upload", uploadSchema);
