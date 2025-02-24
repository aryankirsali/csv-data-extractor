// config/dbConfig.js - MongoDB connection configuration

module.exports = {
  mongoURI:
    process.env.MONGO_URI || "mongodb://localhost:27017/imageProcessingDB",
};
