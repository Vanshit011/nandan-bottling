const express = require("express");
const Delivery = require("../models/Delivery");

const router = express.Router();

// ➜ Add New Delivery (with auto date support)
router.post("/", async (req, res) => {
  try {
    const { customerId, bottles, date } = req.body;

    const delivery = await Delivery.create({
      customerId,
      bottles,
      date: date ? new Date(date) : new Date(),  // ✅ Default to Today if no date provided
    });

    res.json(delivery);
  } catch (error) {
    console.error("Delivery Save Error:", error);
    res.status(500).json({ message: "Error saving delivery" });
  }
});

// ➜ Get All Deliveries (Optional, for testing)
router.get("/", async (req, res) => {
  const deliveries = await Delivery.find().populate("customerId");
  res.json(deliveries);
});

module.exports = router;
