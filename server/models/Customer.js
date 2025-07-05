const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  rate: Number, // Per bottle price
});

module.exports = mongoose.model("Customer", customerSchema);
