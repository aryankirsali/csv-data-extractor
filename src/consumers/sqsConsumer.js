const sqs = require("../aws/sqs");
const Request = require("../models/Request");
const imageProcessingService = require("../services/imageProcessingService");
const axios = require("axios");

const processMessage = async (message) => {
  const { requestId, webhookUrl } = JSON.parse(message.Body);
  try {
    // Retrieve the complete Request document from MongoDB using requestId
    const requestDoc = await Request.findOne({ requestId });
    if (!requestDoc) {
      throw new Error(`Request not found for id: ${requestId}`);
    }

    // Update the Request status to "Processing"
    await Request.updateOne({ requestId }, { status: "Processing" });

    // Process images using the products stored in the Request document
    const processedProducts = await imageProcessingService.processImages(
      requestDoc.products,
      requestId
    );

    // Update the Request document with processed products and mark as "Completed"
    await Request.updateOne(
      { requestId },
      { products: processedProducts, status: "Completed" }
    );

    // Trigger webhook callback if provided
    if (webhookUrl) {
      try {
        await axios.post(webhookUrl, {
          requestId,
          status: "Completed",
          data: processedProducts,
        });
        console.log(`Webhook callback sent for requestId: ${requestId}`);
        await Request.updateOne({ requestId }, { notified: true });
      } catch (webhookError) {
        console.error(
          `Failed to send webhook for requestId: ${requestId}`,
          webhookError
        );
      }
    }

    // Delete the processed message from SQS
    await sqs.deleteMessage(message.ReceiptHandle);
    console.log(`Processed and deleted message for requestId: ${requestId}`);
  } catch (error) {
    console.error(`Error processing request ${requestId}:`, error);
    await Request.updateOne({ requestId }, { status: "Failed" });
    await sqs.deleteMessage(message.ReceiptHandle);
  }
};

const pollSQS = async () => {
  try {
    const data = await sqs.receiveMessages();
    if (data && data.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        await processMessage(message);
      }
    }
  } catch (error) {
    console.error("Error receiving messages from SQS:", error);
  } finally {
    setTimeout(pollSQS, 5000);
  }
};

function start() {
  pollSQS();
}

module.exports = { start };
