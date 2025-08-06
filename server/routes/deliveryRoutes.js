const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');

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

router.post("/", async (req, res) => {
  try {
    const { customerId, date, bottles } = req.body;

    // ✅ Only check fields you actually need
    if (!customerId || !date || !bottles) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Fetch customer by ID
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const ratePerBottle = customer.rate;
    const amount = bottles * ratePerBottle;

    const newDelivery = new Delivery({
      customerId,
      date,
      bottles,
      amount,
    });

    await newDelivery.save();
    res.status(201).json({ message: "Delivery added successfully" });
  } catch (error) {
    console.error("Error in POST /deliveries:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
// router.put('/:id/status', async (req, res) => {
//   try {
//     const delivery = await Delivery.findById(req.params.id);
//     if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

//     delivery.status = delivery.status === 'Paid' ? 'Unpaid' : 'Paid';
//     await delivery.save();

//     res.json({ message: 'Status updated', delivery });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to update status' });
//   }
// });

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
