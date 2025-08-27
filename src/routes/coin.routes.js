const express = require('express');
const router = express.Router();
const {
    getCoinBalance,
    getCoinHistory,
    addCoins
} = require('../controllers/coin.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// যে কোনো লগইন করা ব্যবহারকারী তার নিজের ব্যালেন্স দেখতে পারবে
router.get('/balance', protect, getCoinBalance);

// যে কোনো লগইন করা ব্যবহারকারী তার লেনদেনের ইতিহাস দেখতে পারবে
router.get('/history', protect, getCoinHistory);

// শুধুমাত্র অ্যাডমিন কোনো ব্যবহারকারীর অ্যাকাউন্টে কয়েন যোগ করতে পারবে
router.post('/add', protect, isAdmin, addCoins);

module.exports = router;