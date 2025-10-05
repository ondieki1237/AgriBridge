const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.get('/find', matchController.findMatches);

module.exports = router;
