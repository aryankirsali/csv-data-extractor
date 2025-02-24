// src/controllers/statusController.js - Retrieves the processing status by request ID

const ProcessingRequest = require("../models/ProcessingRequest");

exports.getStatus = async (req, res) => {
  try {
    const requestData = await ProcessingRequest.findOne({
      requestId: req.params.requestId,
    });
    if (!requestData) {
      return res.status(404).json({ error: "Request ID not found" });
    }
    res.status(200).json({
      requestId: requestData.requestId,
      status: requestData.status,
      data: requestData.products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
