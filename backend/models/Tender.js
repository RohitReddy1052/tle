const mongoose = require('mongoose');

const TenderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  estimatedValue: { type: Number, required: true },
  publishDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['open', 'evaluation', 'awarded', 'closed'], default: 'awarded' }
}, { timestamps: true });

module.exports = mongoose.model('Tender', TenderSchema);
