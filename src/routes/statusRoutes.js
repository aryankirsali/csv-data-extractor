// src/routes/statusRoutes.js - Route to query processing status

const express = require("express");
const router = express.Router();
const statusController = require("../controllers/statusController");

// GET /status/:requestId - Retrieve processing status by requestId
router.get("/:requestId", statusController.getStatus);

module.exports = router;
