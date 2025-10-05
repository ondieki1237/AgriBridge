const axios = require('axios');

exports.health = async (req, res) => {
  const base = (process.env.PYTHON_SERVICE_URL && process.env.PYTHON_SERVICE_URL.replace(/\/$/, '')) || 'http://localhost:8000';
  if (!process.env.PYTHON_SERVICE_URL) console.warn('PYTHON_SERVICE_URL not set - falling back to', base);
  try {
    const r = await axios.get(`${base}/health`, { timeout: 3000 });
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: 'Python service unreachable', details: err.message });
  }
};

exports.batchPredict = async (req, res) => {
  const base = (process.env.PYTHON_SERVICE_URL && process.env.PYTHON_SERVICE_URL.replace(/\/$/, '')) || 'http://localhost:8000';
  if (!process.env.PYTHON_SERVICE_URL) console.warn('PYTHON_SERVICE_URL not set - falling back to', base);
  try {
    const r = await axios.post(`${base}/batch_predict`, req.body, { timeout: 10000 });
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: 'Python batch predict failed', details: err.message });
  }
};

