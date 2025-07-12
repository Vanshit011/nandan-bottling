const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  bottles: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // Defaults to current date
  },
  status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid", // Default to Unpaid
  },
});

module.exports = mongoose.model("Delivery", deliverySchema);
