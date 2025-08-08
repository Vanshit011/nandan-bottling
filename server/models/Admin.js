const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const adminSchema = new mongoose.Schema({
  companyId: { type: String, required: true, unique: true }, // unique for each company
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });


module.exports = mongoose.model("Admin", adminSchema);
