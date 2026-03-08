const BrowsingHistory = require("../models/BrowsingHistory");
const Product = require("../models/Product");

exports.saveView = async (userId, productId) => {
  

  await BrowsingHistory.updateOne(
    { userId, productId },
    { viewedAt: new Date() },
    { upsert: true },
  );

  await Product.updateOne({ _id: productId }, { $inc: { popularityScore: 1 } });

  const count = await BrowsingHistory.countDocuments({ userId });

  if (count > 50) {
    const oldest = await BrowsingHistory.find({ userId })
      .sort({ viewedAt: 1 })
      .limit(count - 50);

    const ids = oldest.map((i) => i._id);

    await BrowsingHistory.deleteMany({ _id: { $in: ids } });
  }
};
