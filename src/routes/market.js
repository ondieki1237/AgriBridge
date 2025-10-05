const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/marketController');

router.post('/', ctrl.create); // create market/buyer offer
router.get('/find', ctrl.find); // find markets by crop/location

module.exports = router;
