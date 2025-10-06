// routes/cleanRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { cleanUploadData } = require("../controllers/cleanController");

router.use(authenticate);

router.post("/:id", cleanUploadData); // POST /api/clean/:id

module.exports = router;
