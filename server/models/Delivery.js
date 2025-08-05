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
  amount: {
    type: Number,
    required: true   // ✅ Add this line
  },
  date: {
    type: Date,
    required: true
  },
 
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
