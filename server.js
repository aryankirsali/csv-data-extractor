const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimiter = require("./src/middleware/rateLimiter");
const uploadRoutes = require("./src/routes/uploadRoutes");
const statusRoutes = require("./src/routes/statusRoutes");

const sqsConsumer = require("./src/consumers/sqsConsumer");
const webhookNotifier = require("./src/consumers/webhookNotifier");
const cleanupUploads = require("./src/consumers/cleanupUploads");

// Load environment variables
dotenv.config();

const app = express();

// Use CORS middleware to allow cross-site requests
app.use(cors());

// Use body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Use the rate limiter middleware
app.use(rateLimiter);

const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
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
});

// Start background services once MongoDB connection is open
mongoose.connection.once("open", () => {
  console.log("MongoDB connection open, starting background services...");
  startBackgroundServices();
});
