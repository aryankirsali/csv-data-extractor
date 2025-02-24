// src/producers/producerService.js - Producer service for enqueuing jobs to SQS

const sqs = require("../aws/sqs");

/**
 * Enqueue a processing job to SQS.
 * @param {Object} jobData - The job data (e.g. requestId, products, webhookUrl).
 * @returns {Promise} - SQS response promise.
 */
exports.enqueueJob = async (jobData) => {
  try {
    // Enqueue the job message to SQS
    const result = await sqs.sendMessage(jobData);
    console.log("Job enqueued successfully:", result);
    return result;
  } catch (error) {
    console.error("Error enqueuing job:", error);
    throw error;
  }
};
