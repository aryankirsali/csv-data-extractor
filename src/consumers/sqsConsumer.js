// src/consumers/sqsConsumer.js - Consumer service for processing SQS messages

const sqs = require("../aws/sqs");
const ProcessingRequest = require("../models/ProcessingRequest");
const imageProcessingService = require("../services/imageProcessingService");
const axios = require("axios");

/**
 * Process an individual SQS message.
 * @param {Object} message - The SQS message.
 */
const processMessage = async (message) => {
  const { requestId, products, webhookUrl } = JSON.parse(message.Body);
  try {
    // Update DB: mark the request as "Processing"
    await ProcessingRequest.updateOne({ requestId }, { status: "Processing" });

    // Process images: download, compress, and upload to S3
    const updatedProducts = await imageProcessingService.processImages(
      products
    );

    // Update DB: save processed image URLs and mark as "Completed"
    await ProcessingRequest.updateOne(
      { requestId },
      { products: updatedProducts, status: "Completed" }
    );

    // Trigger webhook callback if provided
    if (webhookUrl) {
      try {
        await axios.post(webhookUrl, {
          requestId,
          status: "Completed",
          products: updatedProducts,
        });
        console.log(`Webhook callback sent for requestId: ${requestId}`);
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
    // Optionally update status as "Failed" and decide whether to leave or delete the message for retry.
    await ProcessingRequest.updateOne({ requestId }, { status: "Failed" });
    await sqs.deleteMessage(message.ReceiptHandle);
  }
};

/**
 * Continuously poll SQS for messages.
 */
const pollSQS = async () => {
  try {
    // Receive messages with long polling
    const data = await sqs.receiveMessages();
    if (data && data.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        await processMessage(message);
      }
    }
  } catch (error) {
    console.error("Error receiving messages from SQS:", error);
  } finally {
    // Continue polling after a delay (e.g., 5 seconds)
    setTimeout(pollSQS, 5000);
  }
};

// Start polling for messages
pollSQS();
