const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.post('/', auth, transactionController.create);
router.get('/:id', auth, transactionController.status);

module.exports = router;
