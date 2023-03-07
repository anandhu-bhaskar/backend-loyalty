const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const checkAuth = require('../middleware/checkAuth');

// Claim reward endpoint
router.get('/transactions', checkAuth, transactionController.getTransactions);

module.exports = router;
