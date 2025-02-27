import { Queue } from "bullmq";

const connection = {
  host: redisUrl.hostname, // ✅ Extract only the hostname
  port: Number(redisUrl.port), // ✅ Convert port to number
  password: redisUrl.password, // ✅ Extract password if needed
};

export const userQueue = new Queue("userQueue", { connection });

console.log(" Redis Queue Initialized");
