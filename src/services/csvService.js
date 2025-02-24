// src/services/csvService.js - Parses CSV, stores initial metadata, and enqueues job via Producer Service

const csvParser = require("../utils/csvParser");
const ProcessingRequest = require("../models/ProcessingRequest");
const { v4: uuidv4 } = require("uuid");
const producerService = require("../producers/producerService");

exports.processCSV = async (file, webhookUrl) => {
  // Parse CSV file to extract product data
  const products = await csvParser.parseCSV(file.path);
  // Generate a unique request ID
  const requestId = uuidv4();
  // Save initial processing request in the database with status "Pending"
  const newRequest = new ProcessingRequest({ requestId, products, webhookUrl });
  await newRequest.save();
  // Enqueue the job using the Producer Service
  await producerService.enqueueJob({ requestId, products, webhookUrl });
  // Return the request ID for client tracking
  return { requestId };
};
