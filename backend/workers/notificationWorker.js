require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Worker MongoDB connected"))
  .catch((err) => console.log("Mongo Error:", err));

const notificationQueue = require("../queues/notificationQueue");
const sendPush = require("../services/pushService");
const NotificationLog = require("../models/notificationLog");
const redis = require("ioredis");
const redisClient = new redis();

notificationQueue.process(async (job) => {
  console.log("🚀 Notification worker started...");
  const { userId, title, body } = job.data;

  try {
    // Redis rate limit
    const key = `rate_limit:${userId}`;
    const exists = await redisClient.get(key);
    if (exists) return;

    await redisClient.set(key, "1", "EX", 60);

    await sendPush(userId, title, body);

    await NotificationLog.create({
      user: userId,
      title,
      body,
      status: "sent",
    });
  } catch (error) {
    console.error("Notification failed:", error);

    await NotificationLog.create({
      user: userId,
      title,
      body,
      status: "failed",
    });

    throw error; // Important for Bull retry
  }
});
