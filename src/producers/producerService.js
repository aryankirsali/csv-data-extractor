const sqs = require("../aws/sqs");

exports.enqueueJob = async (jobData) => {
  try {
    // jobData now contains only requestId and webhookUrl
    const result = await sqs.sendMessage(jobData);
    console.log("Job enqueued successfully:", result);
    return result;
  } catch (error) {
    console.error("Error enqueuing job:", error);
    throw error;
  }
};
