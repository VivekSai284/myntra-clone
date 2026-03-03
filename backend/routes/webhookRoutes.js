const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const AuditLog = require("../models/AuditLog");

router.post("/payment", async (req, res) => {
  try {
    const event = req.body;

    console.log("BODY RECEIVED:", event);

    // ✅ Validate payload
    if (!event || !event.id || !event.payment_id) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    // ✅ Extract safely
    const eventId = event.id;
    const paymentId = event.payment_id;

    // 🛑 IDEMPOTENCY CHECK
    const existing = await Transaction.findOne({
      webhookEventId: eventId,
    });

    if (existing) {
      return res.json({ message: "Already processed" });
    }

    const invoiceId = `INV-${Date.now()}`;

    // ✅ UPSERT TRANSACTION
    const tx = await Transaction.findOneAndUpdate(
      { paymentId },
      {
        userId: event.userId,
        orderId: event.orderId,
        paymentMode: event.paymentMode,
        amount: event.amount,
        status: event.status,
        webhookEventId: eventId,
        invoiceId, // ✅ ADD THIS
      },
      
      { upsert: true, new: true }
    );

    // ✅ AUDIT LOG
    await AuditLog.create({
      userId: event.userId,
      transactionId: tx._id,
      action: event.status?.toUpperCase(),
      metadata: event,
    });

    res.json({ success: true });
  } catch (err) {
  console.error("🔥 FULL WEBHOOK ERROR:", err);
  res.status(500).json({ error: err.message });
}
});

module.exports = router;