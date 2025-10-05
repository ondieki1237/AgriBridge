const path = require('path');
// Load .env from project root so running `node src/index.js` or `node index.js` works reliably
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const produceRoutes = require('./routes/produce');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notification');
const matchRoutes = require('./routes/match');
const transactionRoutes = require('./routes/transaction');
const pythonProxyRoutes = require('./routes/pythonProxy');
const weatherProxyRoutes = require('./routes/weatherProxy');
const marketRoutes = require('./routes/market');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api/produce', produceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/python', pythonProxyRoutes);
app.use('/api/python/weather', weatherProxyRoutes);
app.use('/api/market', marketRoutes);

const PORT = process.env.PORT || 5000;
// Prefer MONGODB_URI (Atlas) but fall back to MONGO_URI or localhost for compatibility
const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/agribridge';

// Mask credentials when logging the URI for debugging
function maskMongoUri(uri) {
  try {
    return uri.replace(/\/\/.+?:.+?@/, '//***:***@');
  } catch (e) {
    return uri;
  }
}

const connectOpts = { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 };

console.log('Attempting Mongo connection to', maskMongoUri(MONGO));

// attempt DB connection then start server. Also verify mailer transport but don't crash if email fails.
const mailer = require('./services/mailer');

mongoose.connect(MONGO, connectOpts)
  .then(async () => {
    console.log('Connected to MongoDB');
    // verify mail transport (non-blocking)
    try {
      await mailer.verifyTransport();
      console.log('Mailer transport verified');
    } catch (e) {
      console.warn('Mailer verify failed (will continue):', e.message || e);
    }

    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err.message || err);
    process.exit(1);
  });
