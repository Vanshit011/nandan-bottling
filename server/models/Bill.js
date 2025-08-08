const mongoose = require('mongoose');
const { stringify } = require('uuid');

const billSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid',
  },
  amount: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Bill', billSchema);
