const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors"); // Import cors middleware
const uploadRoutes = require("./src/routes/uploadRoutes");
const statusRoutes = require("./src/routes/statusRoutes");

// Require background services at the top
const sqsConsumer = require("./src/consumers/sqsConsumer");
const webhookNotifier = require("./src/consumers/webhookNotifier");
const cleanupUploads = require("./src/consumers/cleanupUploads");

dotenv.config();

const app = express();

// Use cors to allow cross-origin requests
app.use(cors());

// Use bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/upload", uploadRoutes);
app.use("/status", statusRoutes);

app.get("/", (req, res) => {
  res.send("CSV Data Extractor API is running");
});

// Function to start background services
function startBackgroundServices() {
  sqsConsumer.start(); // Start SQS consumer service
  webhookNotifier.start(); // Start webhook notifier service
  cleanupUploads.start(); // Start uploads folder cleanup service
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startBackgroundServices();
});
