const express = require('express');
const router = express.Router();
const produceController = require('../controllers/produceController');

// Create produce listing
router.post('/', produceController.createProduce);

// List produce
router.get('/', produceController.listProduce);

module.exports = router;
