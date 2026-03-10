const Cart = require("../models/Bag");
const notificationQueue = require("../queues/notificationQueue");

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ productId, quantity }],
      });
    } else {
      cart.items.push({ productId, quantity });
      cart.updatedAt = new Date();
      await cart.save();
    }

    // 🛒 Schedule reminder after 24 hours
    notificationQueue.add(
      {
        userId,
        title: "Items waiting in cart 🛒",
        body: "Complete your purchase before stock runs out!",
      },
      {
        delay: 1000 * 60 * 60 * 24,
        attempts: 3,
      }
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};