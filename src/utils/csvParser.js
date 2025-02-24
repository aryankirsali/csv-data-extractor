// src/utils/csvParser.js - Utility to parse CSV files using csv-parser

const fs = require("fs");
const csv = require("csv-parser");

exports.parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Map CSV columns to product object fields
        const product = {
          serialNumber: data["S. No."],
          productName: data["Product Name"],
          inputImageUrls: data["Input Image Urls"]
            .split(",")
            .map((url) => url.trim()),
        };
        results.push(product);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};
