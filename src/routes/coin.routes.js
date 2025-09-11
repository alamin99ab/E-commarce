// src/routes/coin.routes.js

const express = require('express');
const router = express.Router();
const { getCoinBalance, addCoins, spendCoins } = require('../controllers/coin.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware'); // আপনার auth middleware ব্যবহার করুন

// ইউজারের নিজের কয়েন ব্যালেন্স দেখার রুট (এই লাইনে সমস্যা ছিল)
router.get('/my-balance', protect, getCoinBalance);

// কয়েন খরচ করার রুট
router.post('/spend', protect, spendCoins);

// অ্যাডমিন কোনো ইউজারকে কয়েন দেওয়ার রুট
router.post('/add', protect, isAdmin, addCoins);

module.exports = router;