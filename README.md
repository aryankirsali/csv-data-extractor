# CSV Data Extractor Documentation

This document provides the Low-Level Design (LLD) details, API specifications with cURL examples, database schema, links to the Postman and High-Level Design (HLD) diagram for the CSV Data Extractor project.


## 4. Postman Collection

Test the API endpoints using the following Postman collection:  
[Postman Collection](https://elements.getpostman.com/redirect?entityId=18293320-4bc58c05-21e2-4f9a-89a4-84afd2aeae7c&entityType=collection)

---

## 5. High-Level Design (HLD)

View the High-Level Design diagram here:  
![CSV-data-extractor](https://github.com/user-attachments/assets/55c7159d-850e-4c8d-9b6b-51060bb11d4c)
[HLD Diagram Link](https://whimsical.com/csv-data-extractor-8Th39LDP9yfSGj7b8sEvgz@or4CdLRbgiv7T21j5EsKt4zWKUmbiDJ3Nxb9Dvm6R)

---

## 1. Working (LLD)

### Overview

The CSV Data Extractor is an asynchronous backend system that:
- Accepts CSV file uploads containing product and image URL data.
- Parses the CSV and stores the extracted data in MongoDB.
- Enqueues a lightweight job (holding only the `requestId` and optional `webhookUrl`) in AWS SQS.
- Uses a Consumer Service to retrieve the full request from MongoDB, process images (download, compress using Sharp, and upload to AWS S3), and update the request document with output (compressed) image URLs.
- Triggers webhook callbacks (immediately via the consumer or later via a Webhook Notifier Service) when processing is complete.
- Includes an Uploads Cleanup Service to periodically delete old CSV files from the uploads folder.
- Uses CORS and a rate limiter middleware to secure the API.

### Components

- **API Server (Producer):**
  - **Endpoints:**  
    - `POST /upload` — Accepts CSV files and an optional webhook URL.
    - `GET /status/:requestId` — Returns processing status and output data if completed.
  - **Function:**  
    - Parses CSV files, creates a Request document in MongoDB (status "Pending"), and enqueues a lightweight job message to AWS SQS.

- **MongoDB:**
  - **Collection:** `requests`
  - **Document Fields:**  
    - `requestId`: Unique string.
    - `status`: `"Pending" | "Processing" | "Completed" | "Failed"`.
    - `webhookUrl`: Optional string.
    - `notified`: Boolean flag (default: false).
    - `products`: Array of objects, each containing:
      - `serialNumber`
      - `productName`
      - `inputImageUrls`
      - `outputImageUrls` (populated after processing)
    - `createdAt` / `updatedAt`: Timestamps.

- **AWS SQS (Standard Queue):**
  - Holds lightweight job messages with `requestId` and `webhookUrl`.

- **Consumer Service (SQS Worker):**
  - Polls AWS SQS, retrieves the full Request document by `requestId`, processes images (download, compress, and upload to S3), updates the Request document (status and output image URLs), triggers immediate webhook callbacks if applicable, and deletes the SQS message.

- **Webhook Notifier Service:**
  - Periodically scans MongoDB for completed requests with pending webhook notifications and sends callbacks.

- **Uploads Cleanup Service:**
  - Periodically cleans the `uploads/` folder by deleting CSV files older than a set threshold.

- **Security Enhancements:**
  - CORS is enabled to allow cross-origin requests.
  - Rate limiting (using `express-rate-limit`) prevents abuse by limiting the number of requests per IP.

---

## 2. APIs (cURL Examples & Sample Responses)

### 2.1 Upload CSV Data

**Endpoint:**  
```
POST https://csv-data-extractor-io43.onrender.com/upload
```

**Description:**  
Uploads a CSV file containing product data. The CSV must include the columns:
- **S. No.**
- **Product Name**
- **Input Image Urls** (comma-separated)

**Request (form-data):**
- **file:** CSV file.
- **webhookUrl:** *(Optional)* Callback URL for notifications.

**cURL Example:**
```bash
curl -X POST "https://csv-data-extractor-io43.onrender.com/upload" \
  -F "file=@/path/to/your/input.csv" \
  -F "webhookUrl=https://your-webhook-url.com/callback"
```

**Sample Response:**
```json
{
  "requestId": "unique-request-id",
  "status": "Job enqueued. Processing will start shortly."
}
```

---

### 2.2 Get Request Data

**Endpoint:**  
```
GET https://csv-data-extractor-io43.onrender.com/status/<requestId>
```

**Description:**  
Retrieves the processing status and, if complete, the processed product data mapping input image URLs to compressed output image URLs.

**cURL Example:**
```bash
curl -X GET "https://csv-data-extractor-io43.onrender.com/status/<requestId>"
```

**Sample Response (Processing):**
```json
{
  "requestId": "unique-request-id",
  "status": "Processing"
}
```

**Sample Response (Completed):**
```json
{
  "requestId": "unique-request-id",
  "status": "Completed",
  "data": [
    {
      "serialNumber": "1",
      "productName": "SKU1",
      "inputImageUrls": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
        "https://example.com/image3.jpg"
      ],
      "outputImageUrls": [
        "https://s3.amazonaws.com/your-bucket/unique1.jpg",
        "https://s3.amazonaws.com/your-bucket/unique2.jpg",
        "https://s3.amazonaws.com/your-bucket/unique3.jpg"
      ]
    }
  ]
}
```

---

## 3. DB Schema

**Collection:** `requests`

**Document Structure:**
```json
{
  "requestId": "string, unique",
  "status": "string, one of: 'Pending', 'Processing', 'Completed', 'Failed'",
  "webhookUrl": "string, optional",
  "notified": "boolean, default: false",
  "products": [
    {
      "serialNumber": "string",
      "productName": "string",
      "inputImageUrls": ["string"],
      "outputImageUrls": ["string"]  // Populated after processing (or "invalid url")
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---
