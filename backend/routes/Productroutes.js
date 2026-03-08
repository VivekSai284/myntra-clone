const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Product.find();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  const productid = req.params.id;
  try {
    const product = await Product.findById(productid);
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/recommend/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const recommendations = await Product.find({
      _id: { $ne: productId },
      brand: currentProduct.brand
    }).limit(6);

    res.json(recommendations);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
