// Import core modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Load configuration variables (e.g., from config/config.js)
const config = require("./config/config");
const dbConfig = require("./config/dbConfig");

// Create an Express application instance
const app = express();

// Setup middleware to parse incoming JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB using the URI from dbConfig
mongoose
  .connect(dbConfig.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes for handling API endpoints
const uploadRoutes = require("./src/routes/uploadRoutes");
const statusRoutes = require("./src/routes/statusRoutes");

// Setup routes
app.use("/upload", uploadRoutes); // Route for CSV uploads
app.use("/status", statusRoutes); // Route for status queries

// Define a basic route to verify server is running
app.get("/", (req, res) => {
  res.send("Image Processing System is running");
});

// Set the server to listen on the defined PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
