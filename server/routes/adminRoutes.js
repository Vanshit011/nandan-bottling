const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { companyName, email, password } = req.body;

    // Check existing email
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Generate unique companyId
    const companyId = uuidv4();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      companyId,
      companyName,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful",
      companyId: admin.companyId
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid Email" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    // Include companyId in token
    const token = jwt.sign(
      { adminId: admin._id, companyId: admin.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      companyId: admin.companyId
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
