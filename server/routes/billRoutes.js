const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new bill record
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { amount, month, year, status, description, customerId } = req.body;

        if (!amount || !month || !year) {
            return res.status(400).json({ message: 'Amount, month, and year are required.' });
        }
        if (status && !['paid', 'unpaid'].includes(status)) {
            return res.status(400).json({ message: "Status must be 'paid' or 'unpaid'." });
        }
        if (month < 1 || month > 12) {
            return res.status(400).json({ message: 'Month must be between 1 and 12.' });
        }

        const bill = new Bill({
            companyId: req.user.companyId,
            customerId,
            amount,
            month,
            year,
            status: status || 'unpaid',
            description: description || '',
        });

        await bill.save();

        res.status(201).json({ message: 'Bill created successfully', bill });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get bills filtered by year and optional month, for the logged-in user's company
router.get('/monthwise', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    const filter = { companyId: req.user.companyId };

    if (year) {
      filter.year = parseInt(year);
    }

    if (month) {
      filter.month = parseInt(month);
    }

    const bills = await Bill.find(filter).sort({ year: 1, month: 1, day: 1 });
    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit/update a bill by id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const billId = req.params.id;
    const updateData = req.body;

    // Ensure the bill belongs to this company before updating
    const bill = await Bill.findOneAndUpdate(
      { _id: billId, companyId: req.user.companyId },
      updateData,
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found or not authorized' });
    }

    res.json({ message: 'Bill updated successfully', bill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a bill by id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const billId = req.params.id;

    // Only delete if bill belongs to user's company
    const result = await Bill.deleteOne({ _id: billId, companyId: req.user.companyId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Bill not found or not authorized' });
    }

    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
