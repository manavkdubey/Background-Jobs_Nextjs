import { Worker } from "bullmq";
import { URL } from "url"; // ✅ Import URL parser
import csv from "csv-parser";
import fs from "fs";
import axios from "axios";
import path from "path";
import dotenv from "dotenv";

dotenv.config(); // ✅ Required for local development

// ✅ Ensure REDIS_URL is set
if (!process.env.REDIS_URL) {
  console.error("❌ ERROR: Missing REDIS_URL in Railway variables.");
  process.exit(1);
}

// ✅ Parse Redis URL safely
const redisUrl = new URL(process.env.REDIS_URL);
const connection = {
  host: redisUrl.hostname, // ✅ Extract only the hostname
  port: Number(redisUrl.port), // ✅ Convert port to number
  password: redisUrl.password, // ✅ Extract password if needed
};

console.log(`🔗 Connecting to Redis at ${connection.host}:${connection.port}`);

console.log("🚀 Worker is running and waiting for jobs...");

const worker = new Worker(
  process.env.WORKER_QUEUE_NAME || "userQueue",
  async (job) => {
    const filePath = path.join(
      process.cwd(),
      process.env.UPLOAD_DIR,
      job.data.filename,
    );
    console.log(`⚡ Processing CSV file: ${filePath}`);

    const users = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          if (row.name && row.email) {
            users.push(row);
          } else {
            console.error("❌ Invalid row:", row);
          }
        })
        .on("end", async () => {
          console.log(`✅ Parsed ${users.length} users. Sending to API...`);

          for (const user of users) {
            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`,
                user,
              );
              console.log(`📤 Sent: ${user.email}`);
            } catch (error) {
              console.error(`❌ Failed to send ${user.email}:`, error.message);
            }
          }

          console.log("✅ CSV processing complete!");
          resolve();
        })
        .on("error", reject);
    });
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err);
});
