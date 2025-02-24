// src/workers/sqsWorker.js - Worker that polls SQS for image processing jobs

const sqs = require("../aws/sqs");
const ProcessingRequest = require("../models/ProcessingRequest");
const imageProcessingService = require("../services/imageProcessingService");

const pollSQS = async () => {
  try {
    // Receive messages with long polling
    const data = await sqs.receiveMessages();
    if (data && data.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        const body = JSON.parse(message.Body);
        const { requestId, products, webhookUrl } = body;
        try {
          // Update DB: mark request as "Processing"
          await ProcessingRequest.updateOne(
            { requestId },
            { status: "Processing" }
          );
          // Process images for the provided products (download, compress, and upload to S3)
          const updatedProducts = await imageProcessingService.processImages(
            products
          );
          // Update DB with processed data and mark as "Completed"
          await ProcessingRequest.updateOne(
            { requestId },
            { products: updatedProducts, status: "Completed" }
          );
          // Optionally trigger webhook callback using axios.post if webhookUrl is provided
          await sqs.deleteMessage(message.ReceiptHandle);
        } catch (error) {
          console.error(`Error processing request ${requestId}:`, error);
          await ProcessingRequest.updateOne(
            { requestId },
            { status: "Failed" }
          );
          await sqs.deleteMessage(message.ReceiptHandle);
        }
      }
    }
  } catch (error) {
    console.error("Error receiving messages from SQS:", error);
  } finally {
    // Poll again after a delay
    setTimeout(pollSQS, 5000);
  }
};

pollSQS();
