const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  productName: { type: String, required: true },
  inputImageUrls: { type: [String], required: true },
  outputImageUrls: { type: [String], default: [] }, // Will be populated after processing
});

const RequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  status: { type: String, default: "Pending" }, // "Pending", "Processing", "Completed", "Failed"
  webhookUrl: { type: String },
  notified: { type: Boolean, default: false }, // For webhook notification
  products: [ProductSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Request", RequestSchema);
