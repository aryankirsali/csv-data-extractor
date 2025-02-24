// src/routes/uploadRoutes.js - Route for CSV upload

const express = require("express");
const router = express.Router();
const multer = require("multer");

// Configure multer to save uploaded CSV files in the 'uploads' folder
const upload = multer({ dest: "uploads/" });
const uploadController = require("../controllers/uploadController");

// POST /upload - Handle CSV file upload
router.post("/", upload.single("file"), uploadController.uploadCSV);

module.exports = router;
