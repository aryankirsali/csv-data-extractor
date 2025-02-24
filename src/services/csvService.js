const csvParser = require("../utils/csvParser");
const Request = require("../models/Request");
const { v4: uuidv4 } = require("uuid");
const producerService = require("../producers/producerService");

exports.processCSV = async (file, webhookUrl) => {
  // Parse CSV file to extract product data
  const products = await csvParser.parseCSV(file.path);
  // Generate a unique requestId
  const requestId = uuidv4();
  // Create a new Request document with input data and status "Pending"
  const newRequest = new Request({ requestId, products, webhookUrl });
  await newRequest.save();
  // Enqueue a job with only the reference info (requestId and webhookUrl)
  await producerService.enqueueJob({ requestId, webhookUrl });
  return { requestId };
};
