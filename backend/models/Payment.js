const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
