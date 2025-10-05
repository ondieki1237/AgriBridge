const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pythonProxyController');

router.get('/health', ctrl.health);
router.post('/batch_predict', ctrl.batchPredict);

module.exports = router;
