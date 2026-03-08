const Product = require("../models/Product")
const BrowsingHistory = require("../models/BrowsingHistory")
const Wishlist = require("../models/Wishlist")

exports.getRecommendations = async (userId, currentProductId) => {

  const currentProduct = await Product.findById(currentProductId)

  if (!currentProduct) return []

  // Last 10 viewed products
  const browsing = await BrowsingHistory
    .find({ userId })
    .sort({ viewedAt: -1 })
    .limit(10)

  const viewedIds = browsing.map(b => b.productId)

  // Wishlist products
  const wishlist = await Wishlist.find({ userId })

  const wishlistIds = wishlist.map(w => w.productId)

  const recommendations = await Product.aggregate([

    {
      $match: {
        _id: { $ne: currentProduct._id },
        isActive: true,
        stock: { $gt: 0 }
      }
    },

    {
      $addFields: {

        // category similarity
        categoryScore: {
          $cond: [
            { $eq: ["$category", currentProduct.category] },
            5,
            0
          ]
        },

        // browsing similarity
        browsingScore: {
          $cond: [
            { $in: ["$_id", viewedIds] },
            3,
            0
          ]
        },

        // wishlist similarity
        wishlistScore: {
          $cond: [
            { $in: ["$_id", wishlistIds] },
            4,
            0
          ]
        }

      }
    },

    {
      $addFields: {
        score: {
          $add: [
            "$categoryScore",
            "$browsingScore",
            "$wishlistScore",

            // fallback popularity
            { $divide: ["$popularityScore", 100] }
          ]
        }
      }
    },

    {
      $sort: { score: -1 }
    },

    {
      $limit: 10
    }

  ])

  return recommendations
}