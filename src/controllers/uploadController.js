const fs = require("fs");
const csvService = require("../services/csvService");

exports.uploadCSV = async (req, res) => {
  try {
    const result = await csvService.processCSV(req.file, req.body.webhookUrl);

    // Delete the uploaded CSV file after successful processing
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting uploaded file:", err);
      } else {
        console.log("Uploaded CSV file deleted successfully.");
      }
    });

    res.status(200).json({
      requestId: result.requestId,
      status: "Job enqueued. Processing will start shortly.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
