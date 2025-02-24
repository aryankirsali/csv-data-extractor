const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const uploadRoutes = require("./src/routes/uploadRoutes");
const statusRoutes = require("./src/routes/statusRoutes");

// Require background services at the top
const sqsConsumer = require("./src/consumers/sqsConsumer");
const webhookNotifier = require("./src/consumers/webhookNotifier");
const cleanupUploads = require("./src/consumers/cleanupUploads");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/upload", uploadRoutes);
app.use("/status", statusRoutes);

app.get("/", (req, res) => {
  res.send("CSV Data Extractor API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Function to start background services
function startBackgroundServices() {
  sqsConsumer.start(); // Start SQS consumer service
  webhookNotifier.start(); // Start webhook notifier service
  cleanupUploads.start(); // Start uploads folder cleanup service
}

// Wait for the MongoDB connection to open before starting background services
mongoose.connection.once("open", () => {
  console.log("MongoDB connection open, starting background services...");
  startBackgroundServices();
});
