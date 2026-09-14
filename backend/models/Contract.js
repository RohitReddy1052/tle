const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  tenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender', required: true },
  winningVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  awardedValue: { type: Number, required: true },
  awardDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Contract', ContractSchema);
