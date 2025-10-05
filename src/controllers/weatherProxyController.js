const axios = require('axios');

exports.weather = async (req, res) => {
  const base = (process.env.PYTHON_SERVICE_URL && process.env.PYTHON_SERVICE_URL.replace(/\/$/, '')) || 'http://localhost:8000';
  if (!process.env.PYTHON_SERVICE_URL) console.warn('PYTHON_SERVICE_URL not set - falling back to', base);
  try {
    const r = await axios.post(`${base}/weather`, req.body, { timeout: 20000 });
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: 'Python weather fetch failed', details: err.message });
  }
};
