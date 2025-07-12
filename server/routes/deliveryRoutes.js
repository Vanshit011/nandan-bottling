const express = require("express");
const Delivery = require("../models/Delivery");

const router = express.Router();

// ✅ POST: Create a new delivery
router.post("/", async (req, res) => {
  try {
    const { name, bottles, date } = req.body;

    if (!name || !bottles) {
      return res.status(400).json({ message: "Name and bottles are required" });
    }

    const delivery = new Delivery({
      name,
      bottles,
      date: date ? new Date(date) : undefined,
      status: "Unpaid" // Default status
    });

    await delivery.save();

    res.status(201).json({
      message: "Delivery saved successfully",
      data: delivery,
    });
  } catch (error) {
    console.error("Error saving delivery:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ GET: All deliveries
router.get("/", async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort({ date: -1 });
    res.json({ deliveries });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ message: "Failed to fetch deliveries" });
  }
});

// ✅ PUT: Edit a delivery
router.put("/:id", async (req, res) => {
  try {
    const { name, bottles, date, status } = req.body;

    const updated = await Delivery.findByIdAndUpdate(
      req.params.id,
      { name, bottles, date, status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.json({ message: "Delivery updated", data: updated });
  } catch (error) {
    console.error("Error updating delivery:", error);
    res.status(500).json({ message: "Failed to update delivery" });
  }
});

// ✅ DELETE: Remove a delivery
router.delete("/:id", async (req, res) => {
  try {
    const removed = await Delivery.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    res.json({ message: "Delivery deleted", data: removed });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ message: "Failed to delete delivery" });
  }
});
module.exports = router;
