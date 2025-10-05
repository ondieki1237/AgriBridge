const Produce = require('../models/Produce');

// Very simple matching: find buyers/offers for similar crop near location
exports.findMatches = async (req, res) => {
  try {
    const { crop, location } = req.query;
    const q = { crop };
    if (location) q.location = location;
    const matches = await Produce.find(q).limit(50);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
