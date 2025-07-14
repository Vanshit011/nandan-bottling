const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  bottles: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  }
});

module.exports = mongoose.model("Delivery", deliverySchema);
