// config/config.js - General project configuration variables

module.exports = {
  awsRegion: process.env.AWS_REGION || "us-east-1",
  s3Bucket: process.env.AWS_S3_BUCKET,
  sqsQueueUrl: process.env.AWS_SQS_QUEUE_URL,
};
