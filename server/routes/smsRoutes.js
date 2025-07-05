const express = require("express");
const sendSms = require("../utils/smsSender");

const router = express.Router();

router.post("/", async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: "Phone and Message Required" });
  }

  try {
    await sendSms(phone, message);
    res.json({ message: "SMS sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send SMS" });
  }
});

module.exports = router;
