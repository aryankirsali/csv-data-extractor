// src/utils/imageDownloader.js - Utility to download images from URLs using axios

const axios = require("axios");

exports.downloadImage = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
};
