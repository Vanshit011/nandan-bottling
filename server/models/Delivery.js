const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  bottles: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
