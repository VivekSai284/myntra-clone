const express = require("express");
const Bag = require("../models/Bag");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { addToCart } = require("../controllers/cartController");
const router = express.Router();

router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, productId, size, quantity } = req.body;

    const product = await Product.findById(productId).session(session);

    if (!product || !product.isActive) throw new Error("Product discontinued");

    if (product.stock < quantity) throw new Error("Not enough stock");

    // check if item already exists
    const existing = await Bag.findOne({
      userId,
      productId,
      size,
      status: "ACTIVE",
    }).session(session);

    if (existing) {
      existing.quantity += quantity;

      if (product.stock < existing.quantity) throw new Error("Stock exceeded");

      await existing.save();
    } else {
      await Bag.create(
        [
          {
            userId,
            productId,
            size,
            quantity,
            priceAtTime: product.price,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    res.status(200).json({ message: "Added to bag" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  }

  session.endSession();
});

router.get("/:userid", async (req, res) => {
  try {
    const items = await Bag.find({ userId: req.params.userid }).populate(
      "productId",
    );

    const activeItems = items.filter((i) => i.status === "ACTIVE");
    const savedItems = items.filter((i) => i.status === "SAVED");

    const total = activeItems.reduce((sum, item) => {
      return sum + item.quantity * item.priceAtTime;
    }, 0);

    res.status(200).json({
      activeItems,
      savedItems,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.put("/update/:itemid", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { quantity } = req.body;

    const item = await Bag.findById(req.params.itemid).session(session);
    const product = await Product.findById(item.productId).session(session);

    if (!product.isActive) throw new Error("Product discontinued");

    if (product.stock < quantity) throw new Error("Stock not available");

    item.quantity = quantity;
    await item.save();

    await session.commitTransaction();
    res.json({ message: "Quantity updated" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  }

  session.endSession();
});

router.put("/save/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndUpdate(req.params.itemid, {
      status: "SAVED",
    });

    res.json({ message: "Moved to saved" });
  } catch (error) {
    res.status(500).json({ message: "Error moving to saved" });
  }
});

router.put("/move-to-bag/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndUpdate(req.params.itemid, {
      status: "ACTIVE",
    });

    res.json({ message: "Moved to bag" });
  } catch (error) {
    res.status(500).json({ message: "Error moving to bag" });
  }
});

router.post("/validate/:userid", async (req, res) => {
  try {
    const items = await Bag.find({
      userId: req.params.userid,
      status: "ACTIVE",
    }).populate("productId");

    for (let item of items) {
      // 1️⃣ Check discontinued
      if (!item.productId.isActive) {
        return res.status(400).json({
          message: "Product discontinued",
          productId: item.productId._id,
        });
      }

      // 2️⃣ Check price change
      if (item.productId.price !== item.priceAtTime) {
        return res.status(400).json({
          message: "Price changed",
          productId: item.productId._id,
          oldPrice: item.priceAtTime,
          newPrice: item.productId.price,
        });
      }

      // 3️⃣ Check stock
      if (item.productId.stock < item.quantity) {
        return res.status(400).json({
          message: "Stock insufficient",
          productId: item.productId._id,
          availableStock: item.productId.stock,
        });
      }
    }

    res.json({ message: "Cart valid" });
  } catch (error) {
    res.status(500).json({ message: "Validation failed" });
  }
});

router.delete("/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.itemid);
    res.status(200).json({ message: "Item removed from bag" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error removing item from bag" });
  }
});

router.post("/add", addToCart);
module.exports = router;
