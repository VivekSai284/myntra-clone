const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    price: Number,
    discount: String,
    description: String,
    sizes: [String],
    images: [String],

    // 🔥 ADD THESE
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);