const express = require('express');
const router = express.Router();
const {
    getCoinBalance,
    getCoinHistory,
    addCoins
} = require('../controllers/coin.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

router.get('/balance', protect, getCoinBalance);
router.get('/history', protect, getCoinHistory);
router.post('/add', protect, isAdmin, addCoins);

module.exports = router;