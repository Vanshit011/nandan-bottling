const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');

// ✅ 1. GET all deliveries
router.get('/', async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching deliveries' });
  }
});
// ✅ 2. POST new delivery
router.post('/', async (req, res) => {
  try {
    const { customerId, bottles, date } = req.body;

    if (!customerId || !bottles || !date) {
      return res.status(400).json({ message: 'customerId, bottles, and date are required' });
    }

    // 🔍 Fetch customer's rate per bottle
    const customer = await customerId.findById(customerId);
    if (!customer || !customer.ratePerBottle) {
      return res.status(404).json({ message: 'Customer or rate per bottle not found' });
    }

    const ratePerBottle = customer.ratePerBottle;
    const amount = bottles * ratePerBottle;

    const delivery = new Delivery({
      customerId,
      bottles,
      date: new Date(date),
      amount,                 // 💰 Save total amount
      status: 'Unpaid'        // Default
    });

    await delivery.save();
    res.status(201).json(delivery);
  } catch (error) {
    console.error('Add delivery error:', error);
    res.status(500).json({ message: 'Failed to add delivery' });
  }
});

// ✅ 3. PUT update/edit delivery by ID
router.put('/:id', async (req, res) => {
  try {
    const { customerId, bottles, date, status } = req.body;

    const updated = await Delivery.findByIdAndUpdate(
      req.params.id,
      { customerId, bottles, date: new Date(date), status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Delivery not found' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update delivery' });
  }
});

// ✅ 4. DELETE delivery by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Delivery.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Delivery not found' });

    res.json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete delivery' });
  }
});

// ✅ 5. PUT toggle status (Paid <-> Unpaid)
router.put('/:id/status', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    delivery.status = delivery.status === 'Paid' ? 'Unpaid' : 'Paid';
    await delivery.save();

    res.json({ message: 'Status updated', delivery });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// ✅ 7. GET: Month-on-Month billing summary for all customers
router.get("/month-on-month-summary", async (req, res) => {
  const { month, year } = req.query;

  const monthInt = parseInt(month);
  const yearInt = parseInt(year);

  try {
    const deliveries = await Delivery.aggregate([
      {
        $match: {
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
          // Don't calculate totalAmount here
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
      {
        $unwind: "$customer"
      },
      {
        $addFields: {
          ratePerBottle: "$customer.rate",
          totalAmount: { $multiply: ["$totalBottles", "$customer.rate"] }
        }
      },
      {
        $project: {
          customerId: "$_id",
          customerName: "$customer.name",
          phone: "$customer.phone",
          ratePerBottle: 1,
          totalDeliveries: 1,
          totalBottles: 1,
          totalAmount: 1,
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
