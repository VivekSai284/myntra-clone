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

router.get("/search", async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const query = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    };

    const products = await Product.find(query)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      data: products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("🔥 PRODUCT SEARCH ERROR:", err);
    res.status(500).json({ message: err.message });
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

    // Break product title into keywords
    const keywords = currentProduct.name.split(" ");

    const recommendations = await Product.aggregate([
      {
        $match: {
          _id: { $ne: currentProduct._id },
        },
      },

      {
        $addFields: {
          titleMatchScore: {
            $size: {
              $setIntersection: [{ $split: ["$name", " "] }, keywords],
            },
          },

          categoryScore: {
            $cond: [{ $eq: ["$category", currentProduct.category] }, 5, 0],
          },

          brandScore: {
            $cond: [{ $eq: ["$brand", currentProduct.brand] }, 2, 0],
          },
        },
      },

      {
        $addFields: {
          score: {
            $add: [
              "$titleMatchScore",
              "$categoryScore",
              "$brandScore",
              { $divide: ["$popularityScore", 100] },
            ],
          },
        },
      },

      {
        $sort: { score: -1 },
      },

      {
        $limit: 10,
      },
    ]);

    res.json(recommendations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
