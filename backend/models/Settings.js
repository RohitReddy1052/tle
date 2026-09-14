const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  priceDeviationWeight: { type: Number, default: 0.30 },
  singleBidderWeight: { type: Number, default: 0.20 },
  winRateWeight: { type: Number, default: 0.15 },
  bidRotationWeight: { type: Number, default: 0.15 },
  relationshipWeight: { type: Number, default: 0.20 }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
