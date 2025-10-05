const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: { type: String },
  contactPhone: { type: String },
  crops: [{ type: String }],
  prices: [{ crop: String, pricePerKg: Number }],
  location: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Market', MarketSchema);
