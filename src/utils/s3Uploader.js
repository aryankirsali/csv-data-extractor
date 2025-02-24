// src/utils/s3Uploader.js - Utility to upload images to AWS S3

const AWS = require("aws-sdk");
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const bucketName = process.env.AWS_S3_BUCKET;

exports.uploadImage = async (buffer, key, contentType = "image/jpeg") => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };
  return new Promise((resolve, reject) => {
    s3.upload(params, (error, data) => {
      if (error) reject(error);
      else resolve(data.Location);
    });
  });
};
