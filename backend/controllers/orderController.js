const Order = require("../models/Order");
const eventEmitter = require("../events/notificationEvents");

exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    // 🔥 Trigger notification event
    eventEmitter.emit("orderPlaced", {
      userId: order.userId,
      orderId: order._id,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );

  // 🔥 Emit event for status change
  eventEmitter.emit("orderStatusUpdated", {
    userId: order.userId,
    status: order.status,
  });

  res.json(order);
};