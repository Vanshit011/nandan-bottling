const express = require("express");
const Customer = require("../models/Customer");
const Delivery = require("../models/Delivery");

const router = express.Router();

// GET /billing?month=7&year=2025
router.get("/", async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const customers = await Customer.find();
    const bills = [];

    let grandTotalBottles = 0;
    let grandTotalAmount = 0;

    for (const customer of customers) {
      const deliveries = await Delivery.find({
        customerId: customer._id,
        date: {
          $gte: new Date(year, month - 1, 1),
          $lte: new Date(year, month, 0),
        },
      }).sort({ date: 1 });

      const totalBottles = deliveries.reduce((sum, d) => sum + d.bottles, 0);
      const amount = totalBottles * customer.rate;

      if (amount > 0) {
        grandTotalBottles += totalBottles;
        grandTotalAmount += amount;

        const unpaidDeliveries = deliveries.filter(d => d.status === "Unpaid");
        const status = unpaidDeliveries.length === 0 ? "Paid" : "Unpaid";

        const message = `Hello ${customer.name}, this is a reminder from Nandan Bottling. Your total delivery for this month is ${totalBottles} bottles. Total bill: ₹${amount}. Kindly complete the payment at your earliest convenience.`;

        bills.push({
          customer,
          totalBottles,
          amount,
          status,
          deliveries, // ✅ Detailed delivery list
          whatsappLink: `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`
        });
      }
    }

    res.json({ bills, grandTotalBottles, grandTotalAmount });

  } catch (error) {
    console.error("Billing fetch error:", error);
    res.status(500).json({ message: "Error fetching billing data" });
  }
});

module.exports = router;
