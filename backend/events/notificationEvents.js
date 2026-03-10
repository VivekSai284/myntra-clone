const EventEmitter = require("events");
const notificationQueue = require("../queues/notificationQueue");

const eventEmitter = new EventEmitter();

// 🛍 Order Placed
eventEmitter.on("orderPlaced", ({ userId }) => {
  notificationQueue.add(
    {
      userId,
      title: "Order Confirmed 🎉",
      body: "Your order has been placed successfully!",
    },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
    }
  );
});

// 🚚 Status Update
eventEmitter.on("orderStatusUpdated", ({ userId, status }) => {
  notificationQueue.add({
    userId,
    title: "Order Update 🚚",
    body: `Your order is now ${status}`,
  });
});

module.exports = eventEmitter;