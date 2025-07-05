const express = require("express");
const Customer = require("../models/Customer");
const Delivery = require("../models/Delivery");

const router = express.Router();

router.get("/", async (req, res) => {
  const { month, year } = req.query;
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
    });

    const totalBottles = deliveries.reduce((sum, d) => sum + d.bottles, 0);
    const amount = totalBottles * customer.rate;

    // ✅ Skip customers with 0 billing
    if (amount > 0) {
      grandTotalBottles += totalBottles;
      grandTotalAmount += amount;

      const message = `Hello ${customer.name}, this is a reminder from Nandan Bottling. Your total delivery for this month is ${totalBottles} bottles. Total bill: ₹${amount}. Kindly complete the payment at your earliest convenience. Thank you!`;

      bills.push({
        customer,
        totalBottles,
        amount,
        whatsappLink: `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`,
      });
    }
  }

  res.json({ bills, grandTotalBottles, grandTotalAmount });
});

module.exports = router;
