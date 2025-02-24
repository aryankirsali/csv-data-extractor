// src/controllers/uploadController.js - Handles CSV upload and returns a requestId

const csvService = require("../services/csvService");

exports.uploadCSV = async (req, res) => {
  try {
    const result = await csvService.processCSV(req.file, req.body.webhookUrl);
    res
      .status(200)
      .json({
        requestId: result.requestId,
        status: "Job enqueued. Processing will start shortly.",
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
