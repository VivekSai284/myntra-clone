const Queue = require("bull");

const notificationQueue = new Queue("notifications", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
  limiter: {
    max: 10,
    duration: 1000,
  },
});

module.exports = notificationQueue;