const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  tenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender', required: true },
  verdict: { 
    type: String, 
    enum: ['confirmed_risk', 'false_positive', 'needs_more_data'], 
    required: true 
  },
  notes: { type: String, default: '' },
  auditorName: { type: String, default: 'Auditor' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
