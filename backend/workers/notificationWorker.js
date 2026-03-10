const notificationQueue = require("../queues/notificationQueue");
const sendPush = require("../services/pushService");
const NotificationLog = require("../models/notificationLog");

notificationQueue.process(async (job) => {
  console.log("Processing job:", job.data);
  const { userId, title, body } = job.data;

  // RATE LIMIT (1 per minute)
  const last = await NotificationLog.findOne({ user: userId }).sort({
    createdAt: -1,
  });

  if (last && Date.now() - last.createdAt < 60000) {
    return;
  }

  await sendPush(userId, title, body);

  await NotificationLog.create({ user: userId });
});
