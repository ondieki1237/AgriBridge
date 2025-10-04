require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const produceRoutes = require('./routes/produce');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api/produce', produceRoutes);

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

mongoose.connect(MONGO, connectOpts)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err.message || err);
    process.exit(1);
  });
