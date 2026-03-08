const mongoose = require("mongoose")

const browsingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    index: true
  },

  viewedAt: {
    type: Date,
    default: Date.now,
    expires: 2592000   // auto delete after 30 days
  }

})

browsingSchema.index({ userId: 1, productId: 1 }, { unique: true })

module.exports = mongoose.model("BrowsingHistory", browsingSchema)