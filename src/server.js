// server.js - Entry point for the Express app (Producer & Consumer)

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const uploadRoutes = require("./routes/uploadRoutes");
const statusRoutes = require("./routes/statusRoutes");

// Load environment variables
dotenv.config();

// Create an Express app instance (Producer)
const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB using Mongoose
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mount API routes (Producer endpoints)
app.use("/upload", uploadRoutes);
app.use("/status", statusRoutes);

// Basic route to check server health
app.get("/", (req, res) => {
  res.send("CSV Data Extractor API is running");
});

// Start the server on the specified PORT (Producer)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start the SQS consumer (Consumer)
  // This will continuously poll the SQS queue for jobs
  require("./consumers/sqsConsumer");
});
