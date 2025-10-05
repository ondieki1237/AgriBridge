const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.post('/notify', auth, notificationController.notifySubscribers);

module.exports = router;
