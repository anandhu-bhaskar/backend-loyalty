const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const { trothTokenController } = require('../controllers/trothTokenController');

router.get('/totalSupply', trothTokenController.totalSupply);
router.get('/name', trothTokenController.name);
router.get('/symbol', trothTokenController.symbol);
router.get('/decimals', trothTokenController.decimals);
router.post('/balanceOf', trothTokenController.balanceOf);
router.post('/mint', trothTokenController.mint);
router.post('/setOwner', trothTokenController.setOwner);
router.post('/pause', trothTokenController.pause);
router.post('/unpause', trothTokenController.unpause);
router.post('/transfer', checkAuth, trothTokenController.transfer);
router.post('/transferFrom', trothTokenController.transferFrom);
router.post('/burn', trothTokenController.burn);

module.exports = router;
