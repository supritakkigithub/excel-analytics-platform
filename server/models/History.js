const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: "Upload", required: true },
  action: { type: String, required: true }, // e.g., "chart_generated"
  chartType: { type: String }, // e.g., "Bar", "Line", etc.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", historySchema); 