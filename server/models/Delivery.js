const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  date: Date,
  bottles: Number,
});

module.exports = mongoose.model("Delivery", deliverySchema);
