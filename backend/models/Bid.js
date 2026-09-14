const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  tenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  bidAmount: { type: Number, required: true },
  submittedAt: { type: Date, required: true },
  status: { type: String, enum: ['submitted', 'accepted', 'rejected'], default: 'submitted' }
}, { timestamps: true });

module.exports = mongoose.model('Bid', BidSchema);
