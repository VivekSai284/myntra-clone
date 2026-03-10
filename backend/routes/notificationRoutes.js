const express = require("express");
const router = express.Router();
const { registerToken } = require("../controllers/notificationController");

router.post("/register", registerToken);

module.exports = router;