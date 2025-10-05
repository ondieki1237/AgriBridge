const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/weatherProxyController');

router.post('/', ctrl.weather);

module.exports = router;
