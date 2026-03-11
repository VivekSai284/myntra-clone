const notificationQueue = require("./queues/notificationQueue");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Worker MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

async function test() {
  await notificationQueue.add({
    userId: "699b135fd20b86a629eaec8b",
    title: "Test Notification",
    body: "This is a test push notification",
  });

  console.log("Test job added to queue");
}

test();