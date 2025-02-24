const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const REGION = process.env.AWS_REGION || "us-east-1";
const s3Client = new S3Client({ region: REGION });
const bucketName = process.env.AWS_S3_BUCKET;

exports.uploadImage = async (buffer, key, contentType = "image/jpeg") => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL removed as the bucket does not allow ACLs (use bucket policy or pre-signed URLs instead)
  });

  try {
    await s3Client.send(command);
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return url;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw error;
  }
};
