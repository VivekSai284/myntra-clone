const EventEmitter = require("events");
const notificationQueue = require("../queues/notificationQueue");

const eventEmitter = new EventEmitter();

// 🛍 Order Placed
eventEmitter.on("orderPlaced", ({ userId }) => {
  notificationQueue.add(
    "orderPlaced",
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
  notificationQueue.add(
    "orderStatusUpdated",
    {
      userId,
      title: "Order Update 🚚",
      body: `Your order is now ${status}`,
    },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
    }
  );
});

// 🛒 Cart Abandoned (Scheduled)
eventEmitter.on("cartAbandoned", ({ userId }) => {
  notificationQueue.add(
    "cartReminder",
    {
      userId,
      title: "Items Waiting 🛍",
      body: "Complete your purchase before items go out of stock!",
    },
    {
      delay: 2 * 60 * 60 * 1000, // 2 hours delay
      attempts: 3,
    }
  );
});

module.exports = eventEmitter;