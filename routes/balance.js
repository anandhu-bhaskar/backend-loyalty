const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const balanceController = require('../controllers/balanceController');
const router = express.Router();

// Get KRON token balance route
router.get('/kron', checkAuth, balanceController.getKronBalance);

module.exports = router;