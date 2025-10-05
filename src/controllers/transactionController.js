const Transaction = require('../models/Transaction');
const Produce = require('../models/Produce');

exports.create = async (req, res) => {
  try {
    const { buyerId, farmerId, produceId, amount } = req.body;
    const t = new Transaction({ buyerId, farmerId, produceId, amount });
    await t.save();
    // optional: mark produce as reserved in metadata
    await Produce.findByIdAndUpdate(produceId, { $set: { 'metadata.reserved': true } });
    res.status(201).json(t);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.status = async (req, res) => {
  try {
    const t = await Transaction.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
