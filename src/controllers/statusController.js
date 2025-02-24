const Request = require("../models/Request");

exports.getStatus = async (req, res) => {
  const { requestId } = req.params;
  try {
    const requestData = await Request.findOne({ requestId });
    if (!requestData) {
      return res.status(404).json({ error: "Request ID not found" });
    }
    // If processing is complete, include the processed products data
    return res.status(200).json({
      requestId: requestData.requestId,
      status: requestData.status,
      data:
        requestData.status === "Completed" ? requestData.products : undefined,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
