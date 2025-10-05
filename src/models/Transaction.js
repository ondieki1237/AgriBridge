const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  produceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
  status: { type: String, enum: ['initiated','paid','completed','cancelled'], default: 'initiated' },
  amount: { type: Number, required: true },
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
