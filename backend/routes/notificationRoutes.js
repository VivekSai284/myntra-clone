const express = require("express");
const router = express.Router();
const { registerToken } = require("../controllers/notificationController");

router.post("/register", async (req, res) => {
  const { userId, token } = req.body;

  await DeviceToken.updateOne(
    { userId, token },
    { userId, token },
    { upsert: true }
  );

  res.json({ success: true });
});

module.exports = router;