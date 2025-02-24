// src/services/imageProcessingService.js - Processes images: downloads, compresses, and uploads to S3

const sharp = require("sharp");
const s3Uploader = require("../utils/s3Uploader");
const imageDownloader = require("../utils/imageDownloader");

exports.processImages = async (products) => {
  const updatedProducts = [];
  // Loop through each product
  for (const product of products) {
    const outputImageUrls = [];
    // Process each image URL for the product
    for (const imageUrl of product.inputImageUrls) {
      try {
        // Download image as buffer
        const imageBuffer = await imageDownloader.downloadImage(imageUrl);
        // Compress image using sharp (50% quality for JPEG)
        const compressedBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 50 })
          .toBuffer();
        // Generate a unique key for S3
        const outputKey = `processed/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.jpg`;
        // Upload the image to S3 and get the public URL
        const outputUrl = await s3Uploader.uploadImage(
          compressedBuffer,
          outputKey
        );
        outputImageUrls.push(outputUrl);
      } catch (error) {
        console.error(`Error processing image ${imageUrl}:`, error);
        outputImageUrls.push(null);
      }
    }
    updatedProducts.push({ ...product, outputImageUrls });
  }
  return updatedProducts;
};
