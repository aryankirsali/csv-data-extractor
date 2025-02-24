const Request = require("../models/Request");
const axios = require("axios");

async function checkAndSendWebhook() {
  try {
    const requests = await Request.find({
      webhookUrl: { $ne: null },
      status: "Completed",
      notified: false,
    });
    for (const req of requests) {
      try {
        await axios.post(req.webhookUrl, {
          requestId: req.requestId,
          status: "Completed",
          data: req.products,
        });
        req.notified = true;
        await req.save();
        console.log(`Webhook sent for requestId: ${req.requestId}`);
      } catch (err) {
        console.error(
          `Failed to send webhook for requestId: ${req.requestId}`,
          err
        );
      }
    }
  } catch (error) {
    console.error("Error in webhook notifier:", error);
  }
}

// Export a start function that sets an interval to check for webhooks
function start() {
  setInterval(checkAndSendWebhook, 60 * 1000); // every minute
}

module.exports = { start };
