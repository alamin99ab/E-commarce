const User = require('../models/user.model');
const CoinTransaction = require('../models/coinTransaction.model');
const crypto = require('crypto');

// @desc    Get current user's coin balance
// @route   GET /api/v1/coins/balance
// @access  Private
const getCoinBalance = async (req, res, next) => {
    try {
        // req.user অবজেক্টটি আমাদের protect মিডলওয়্যার থেকে আসছে
        res.status(200).json({
            coinBalance: req.user.coinBalance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get coin transaction history for the logged-in user
// @route   GET /api/v1/coins/history
// @access  Private
const getCoinHistory = async (req, res, next) => {
    try {
        const transactions = await CoinTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};

// @desc    Add coins to a user's account (Admin only)
// @route   POST /api/v1/coins/add
// @access  Private/Admin
const addCoins = async (req, res, next) => {
    const { userId, amount, description } = req.body;
    if (!userId || !amount || !description) {
        return res.status(400).json({ message: 'User ID, amount, and description are required.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // ব্যবহারকারীর কয়েন ব্যালেন্স আপডেট করুন
        user.coinBalance += Number(amount);

        // একটি নতুন কয়েন লেনদেন রেকর্ড তৈরি করুন
        await CoinTransaction.create({
            user: userId,
            type: 'credit',
            amount: Number(amount),
            description: description,
            transactionId: crypto.randomBytes(16).toString('hex') // একটি ইউনিক ট্রানজেকশন আইডি
        });

        await user.save();

        res.status(200).json({
            message: `${amount} coins added successfully to ${user.name}.`,
            newBalance: user.coinBalance
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCoinBalance,
    getCoinHistory,
    addCoins
};