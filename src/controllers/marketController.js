const Market = require('../models/Market');

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    const m = new Market(payload);
    const saved = await m.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.find = async (req, res) => {
  try {
    const { crop, location } = req.query;
    const q = {};
    if (crop) q.crops = crop;
    if (location) q.location = new RegExp(location, 'i');
    const results = await Market.find(q).limit(50).lean();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
