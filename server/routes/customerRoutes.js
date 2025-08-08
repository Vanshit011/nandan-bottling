const express = require("express");
const Customer = require("../models/Customer");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Create Customer (company-specific)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      companyId: req.user.companyId // from token
    });
    res.json(customer);
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// Get All Customers for this company
router.get("/", authMiddleware, async (req, res) => {
  try {
    const customers = await Customer.find({ companyId: req.user.companyId });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Update Customer (company-specific)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(updatedCustomer);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// Delete Customer (company-specific)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedCustomer = await Customer.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId
    });
    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

module.exports = router;
