const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const authMiddleware = require('../middlewares/authMiddleware');

// GET all deliveries for this company
router.get('/', authMiddleware, async (req, res) => {
  try {
    const deliveries = await Delivery.find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .populate("customerId");
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching deliveries' });
  }
});

// POST new delivery
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { customerId, date, bottles } = req.body;
    if (!customerId || !date || !bottles) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure customer belongs to this company
    const customer = await Customer.findOne({ _id: customerId, companyId: req.user.companyId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found or not yours" });
    }

    const ratePerBottle = customer.rate;
    const amount = bottles * ratePerBottle;

    const newDelivery = new Delivery({
      customerId,
      date,
      bottles,
      amount,
      companyId: req.user.companyId
    });

    await newDelivery.save();
    res.status(201).json({ message: "Delivery added successfully", delivery: newDelivery });
  } catch (error) {
    console.error("Error in POST /deliveries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update delivery
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Delivery.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Delivery not found or not yours' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update delivery' });
  }
});

// DELETE delivery
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Delivery.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!deleted) return res.status(404).json({ message: 'Delivery not found or not yours' });

    res.json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete delivery' });
  }
});

// Month-on-Month billing summary
router.get("/month-on-month-summary", authMiddleware, async (req, res) => {
  const { month, year } = req.query;
  const monthInt = parseInt(month);
  const yearInt = parseInt(year);

  try {
    const deliveries = await Delivery.aggregate([
      {
        $match: {
          companyId: req.user.companyId,
          date: {
            $gte: new Date(`${yearInt}-${monthInt}-01`),
            $lt: new Date(`${yearInt}-${monthInt + 1}-01`)
          }
        }
      },
      {
        $group: {
          _id: "$customerId",
          totalDeliveries: { $sum: 1 },
          totalBottles: { $sum: "$bottles" }
        }
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      {
        $project: {
          customerId: "$_id",
          customerName: "$customer.name",
          phone: "$customer.phone",
          ratePerBottle: "$customer.rate",
          totalDeliveries: 1,
          totalBottles: 1,
          totalAmount: { $multiply: ["$totalBottles", "$customer.rate"] },
          month: {
            $concat: [
              { $toString: monthInt },
              "-",
              { $toString: yearInt }
            ]
          }
        }
      }
    ]);

    res.json(deliveries);
  } catch (err) {
    console.error("Error in summary:", err);
    res.status(500).json({ message: "Failed to generate summary" });
  }
});

module.exports = router;
