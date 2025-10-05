const Produce = require('../models/Produce');
const mailer = require('../services/mailer');
const axios = require('axios');
const recommender = require('../services/recommender');

exports.createProduce = async (req, res) => {
  try {
    const { farmerId, crop, quantityKg, location } = req.body;
    const p = new Produce({ farmerId, crop, quantityKg, location });
    const saved = await p.save();

    // Notify subscribed buyers via email (simple example)
    const subject = `New ${crop} listing: ${quantityKg}kg`;
    const html = `<p>A farmer has posted ${quantityKg}kg of <strong>${crop}</strong> at ${location}.</p>`;

    // mailer.sendMail supports sending to multiple recipients. Using env SUBSCRIBERS as comma-separated list for demo.
    const subs = (process.env.SUBSCRIBERS || '').split(',').filter(s => s);
    if (subs.length) {
      await mailer.sendMail({ to: subs, subject, html });
    }

    // Call recommender (prediction + weather + action rules) and persist into metadata
    try {
      const recPayload = {
        crop,
        quantityKg,
        location,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      };
      const rec = await recommender.recommend(recPayload);
      if (rec) {
        saved.metadata = saved.metadata || {};
        saved.metadata.recommendations = rec.recommendations || [];
        saved.metadata.spoilage = rec.prediction || { spoilage_risk: rec.spoilage_score };
        saved.metadata.weather = rec.weather || null;
        await saved.save();
      }
    } catch (e) {
      console.warn('Recommender failed (non-fatal):', e.message || e);
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listProduce = async (req, res) => {
  try {
    const items = await Produce.find().sort({ createdAt: -1 }).limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
