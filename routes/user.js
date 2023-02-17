const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const userController = require('../controllers/userController');
const router = express.Router();

// Get user details route
router.get('/details', checkAuth, userController.getUserDetails);

module.exports = router;