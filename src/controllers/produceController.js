const Produce = require('../models/Produce');
const mailer = require('../services/mailer');
const axios = require('axios');

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

    // Call Python microservice for spoilage risk (if configured)
    if (process.env.PYTHON_SERVICE_URL) {
      try {
        await axios.post(`${process.env.PYTHON_SERVICE_URL.replace(/\/$/, '')}/predict`, {
          crop,
          quantityKg,
          location
        }, { timeout: 5000 });
      } catch (err) {
        console.warn('Python service call failed', err.message);
      }
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
