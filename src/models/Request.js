const mongoose = require("mongoose");

const STATUS_ENUM = ["Pending", "Processing", "Completed", "Failed"];

const ProductSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  productName: { type: String, required: true },
  inputImageUrls: { type: [String], required: true },
  outputImageUrls: { type: [String], default: [] }, // Will be populated after processing
});

const RequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  status: { type: String, enum: STATUS_ENUM, default: "Pending" }, // Enforcing enum
  webhookUrl: { type: String },
  notified: { type: Boolean, default: false }, // For webhook notification
  products: [ProductSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Request", RequestSchema);
