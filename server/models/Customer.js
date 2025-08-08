const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  rate: { type: Number, required: true }, // per bottle price
  companyId: { type: String, required: true } // Link to the company
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
