const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/checkAuth');
const usdConvertController = require('../controllers/usdConvertController');

// Convert TrothToken to USD endpoint
router.get('/usd-convert', checkAuth, usdConvertController.convertTrothToUSD);

module.exports = router;

// ************************************************************************************************
// remove this route in cleanup
// ************************************************************************************************
