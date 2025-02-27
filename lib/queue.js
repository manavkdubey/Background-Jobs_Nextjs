import { Queue } from "bullmq";

console.log(process.env);

if (!process.env.REDIS_URL) {
  console.error("❌ ERROR: Missing REDIS_URL in Railway variables.");
  process.exit(1);
}

console.log("🔍 DEBUG ENV: REDIS_URL =", process.env.REDIS_URL);

// ✅ Parse Redis URL safely
const redisUrl = new URL(process.env.REDIS_URL);

const connection = {
  host: redisUrl.hostname, // ✅ Extract only the hostname
  port: Number(redisUrl.port), // ✅ Convert port to number
  password: redisUrl.password, // ✅ Extract password if needed
};

export const userQueue = new Queue("userQueue", { connection });

console.log(" Redis Queue Initialized");
