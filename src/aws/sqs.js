// src/aws/sqs.js - AWS SQS helper module
const dotenv = require("dotenv");
const AWS = require("aws-sdk");
dotenv.config();

AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

// Get SQS Queue URL from environment variables
const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;

module.exports = {
  // Send a single message to SQS
  sendMessage: async (messageBody) => {
    const params = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(messageBody),
    };
    return sqs.sendMessage(params).promise();
  },

  // Send a batch of messages (max 10 per batch)
  sendMessageBatch: async (messages) => {
    const entries = messages.map((message, index) => ({
      Id: index.toString(),
      MessageBody: JSON.stringify(message),
    }));
    const params = {
      QueueUrl: QUEUE_URL,
      Entries: entries,
    };
    return sqs.sendMessageBatch(params).promise();
  },

  // Receive messages with long polling
  receiveMessages: async (maxNumberOfMessages = 10, waitTimeSeconds = 20) => {
    const params = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: maxNumberOfMessages,
      WaitTimeSeconds: waitTimeSeconds,
    };
    return sqs.receiveMessage(params).promise();
  },

  // Delete a single message from SQS
  deleteMessage: async (receiptHandle) => {
    const params = {
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
    };
    return sqs.deleteMessage(params).promise();
  },

  // Delete a batch of messages from SQS
  deleteMessageBatch: async (receiptHandles) => {
    const entries = receiptHandles.map((receiptHandle, index) => ({
      Id: index.toString(),
      ReceiptHandle: receiptHandle,
    }));
    const params = {
      QueueUrl: QUEUE_URL,
      Entries: entries,
    };
    return sqs.deleteMessageBatch(params).promise();
  },
};
