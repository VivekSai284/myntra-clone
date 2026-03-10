const DeviceToken = require("../models/deviceToken");

exports.registerToken = async (req, res) => {
  const { userId, token } = req.body;

  await DeviceToken.findOneAndUpdate(
    { token },
    { user: userId, lastUsed: new Date() },
    { upsert: true }
  );

  res.json({ message: "Token registered successfully" });
};