const fs = require("fs").promises;
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

async function cleanUploadsFolder() {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const now = Date.now();
    const threshold = 4 * 60 * 1000; // 10 minutes

    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      try {
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > threshold) {
          await fs.unlink(filePath);
          console.log(`Deleted old file: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
      }
    }
  } catch (err) {
    console.error("Error reading uploads directory:", err);
  }
}

// Export a start function that runs cleanup immediately and then periodically
function start() {
  cleanUploadsFolder();
  setInterval(cleanUploadsFolder, 2 * 60 * 1000); // every 2 minutes
}

module.exports = { start };
