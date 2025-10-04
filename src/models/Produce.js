const mongoose = require('mongoose');

const ProduceSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  crop: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  location: { type: String },
  metadata: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Produce', ProduceSchema);
