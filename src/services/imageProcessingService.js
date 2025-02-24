const sharp = require("sharp");
const s3Uploader = require("../utils/s3Uploader");
const imageDownloader = require("../utils/imageDownloader");

/**
 * Process images for a given set of products.
 * For each product, compress each input image and upload to S3 under key: requestId/serialNumber/uniqueFilename.jpg.
 * If processing fails, "invalid url" is used.
 * Returns an array of products with outputImageUrls populated.
 */
exports.processImages = async (products, requestId) => {
  const processedProducts = [];
  for (const product of products) {
    const { serialNumber, productName, inputImageUrls } = product;
    const outputImageUrls = [];
    for (const url of inputImageUrls) {
      try {
        const imageBuffer = await imageDownloader.downloadImage(url);
        const compressedBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 50 })
          .toBuffer();
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const s3Key = `${requestId}/${serialNumber}/${uniqueSuffix}.jpg`;
        const outputUrl = await s3Uploader.uploadImage(compressedBuffer, s3Key);
        outputImageUrls.push(outputUrl);
      } catch (error) {
        console.error(`Error processing image ${url}:`, error);
        outputImageUrls.push("invalid url");
      }
    }
    processedProducts.push({
      serialNumber,
      productName,
      inputImageUrls,
      outputImageUrls,
    });
  }
  return processedProducts;
};
