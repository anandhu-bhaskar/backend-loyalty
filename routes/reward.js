
const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const checkAuth = require('../middleware/checkAuth');

// Claim reward endpoint
router.post('/claim-reward', checkAuth, rewardController.claimReward);

module.exports = router;