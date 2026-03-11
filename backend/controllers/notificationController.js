const DeviceToken = require("../models/deviceToken");

exports.registerToken = async (req, res) => {
  const { userId, token, platform } = req.body;

  await DeviceToken.findOneAndUpdate(
    { token },
    { user: userId, platform, lastUsed: new Date() },
    { upsert: true }
  );

  res.json({ message: "Token registered successfully" });
};
