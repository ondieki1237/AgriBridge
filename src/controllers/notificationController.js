const mailer = require('../services/mailer');
const User = require('../models/User');

exports.notifySubscribers = async (req, res) => {
  try {
    const { subject, html } = req.body;
    const subs = await User.find({ subscribed: true }).select('email -_id');
    const to = subs.map(s => s.email).filter(Boolean);
    if (!to.length) return res.status(400).json({ error: 'No subscribers' });
    await mailer.sendMail({ to, subject, html });
    res.json({ message: 'Notified' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
