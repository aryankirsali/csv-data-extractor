const dotenv = require("dotenv");
dotenv.config();
const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;
if (!QUEUE_URL) {
  throw new Error("AWS_SQS_QUEUE_URL is not set in the environment variables.");
}

module.exports = {
  sendMessage: async (messageBody) => {
    const params = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(messageBody),
    };
    return sqs.sendMessage(params).promise();
  },
  sendMessageBatch: async (messages) => {
    const entries = messages.map((message, index) => ({
      Id: index.toString(),
      MessageBody: JSON.stringify(message),
    }));
    const params = { QueueUrl: QUEUE_URL, Entries: entries };
    return sqs.sendMessageBatch(params).promise();
  },
  receiveMessages: async (maxNumberOfMessages = 10, waitTimeSeconds = 20) => {
    const params = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: maxNumberOfMessages,
      WaitTimeSeconds: waitTimeSeconds,
    };
    return sqs.receiveMessage(params).promise();
  },
  deleteMessage: async (receiptHandle) => {
    const params = { QueueUrl: QUEUE_URL, ReceiptHandle: receiptHandle };
    return sqs.deleteMessage(params).promise();
  },
  deleteMessageBatch: async (receiptHandles) => {
    const entries = receiptHandles.map((handle, index) => ({
      Id: index.toString(),
      ReceiptHandle: handle,
    }));
    const params = { QueueUrl: QUEUE_URL, Entries: entries };
    return sqs.deleteMessageBatch(params).promise();
  },
};
