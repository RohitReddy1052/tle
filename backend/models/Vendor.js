const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationDate: { type: Date, required: true },
  address: { type: String, required: true },
  directorNames: [{ type: String }],
  taxId: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);
