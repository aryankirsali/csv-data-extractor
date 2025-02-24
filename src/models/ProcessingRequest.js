// src/models/ProcessingRequest.js - Mongoose model for processing requests

const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  productName: { type: String, required: true },
  inputImageUrls: { type: [String], required: true },
  outputImageUrls: { type: [String], default: [] },
});

const ProcessingRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  status: { type: String, default: "Pending" },
  products: [ProductSchema],
  webhookUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProcessingRequest", ProcessingRequestSchema);
