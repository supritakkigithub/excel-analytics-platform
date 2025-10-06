// routes/uploadRoutes.js
const express = require("express");
const router = express.Router();

const {
  createUpload,
  getUserUploads,
  getAllUploads,
  getUploadContent,
  cleanUploadContent,
  getCleanedContent,
  saveCleanedContent,
  deleteSelectedRows,
  getOriginalContent,
  updateUploadContent,
  getUploadsByUserId
} = require("../controllers/uploadController");

const { authenticate } = require("../middleware/authMiddleware");
const { getParsedContent } = require("../controllers/dataController");
const { validateUploadsList } = require("../middleware/validate");

// ✅ Apply auth middleware to protect all routes
router.use(authenticate);

// List uploads for logged in user (with filters)
router.get("/user", validateUploadsList, getUserUploads);

// Existing routes (content, clean, downloads, admin-specific etc.)
router.get("/all", getAllUploads);
router.get("/content/:id", getUploadContent);
router.get("/parsed/:id", getParsedContent);
router.get("/cleaned/:id", getCleanedContent);
router.get("/original/:id", getOriginalContent); // 🆕 Add this route
router.put('/:id', updateUploadContent);
router.post('/clean/:id', cleanUploadContent);
router.post('/save/:id', saveCleanedContent);
router.post('/', createUpload);

// Admin specific
router.get("/user/:userId", getUploadsByUserId);

module.exports = router;
