// src/controllers/coin.controller.js

const Coin = require('../models/coin.model');

// ইউজারের কয়েন ব্যালেন্স দেখার জন্য
exports.getCoinBalance = async (req, res, next) => {
    try {
        let userCoin = await Coin.findOne({ user: req.user._id });

        if (!userCoin) {
            userCoin = await Coin.create({ user: req.user._id, balance: 0, transactions: [] });
        }

        res.status(200).json({
            success: true,
            balance: userCoin.balance,
            transactions: userCoin.transactions,
        });
    } catch (error) {
        next(error);
    }
};

// সিস্টেমে কয়েন যোগ করার জন্য (অ্যাডমিন)
exports.addCoins = async (req, res, next) => {
    try {
        const { userId, amount, description } = req.body;

        let userCoin = await Coin.findOne({ user: userId });
        if (!userCoin) {
            userCoin = await Coin.create({ user: userId, balance: 0, transactions: [] });
        }

        userCoin.balance += Number(amount);
        userCoin.transactions.push({
            type: 'earned',
            amount: Number(amount),
            description,
        });

        await userCoin.save();

        res.status(200).json({ success: true, message: 'Coins added successfully.' });
    } catch (error) {
        next(error);
    }
};

// কয়েন খরচ করার জন্য
exports.spendCoins = async (req, res, next) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user._id;

        let userCoin = await Coin.findOne({ user: userId });

        if (!userCoin || userCoin.balance < Number(amount)) {
            return res.status(400).json({ success: false, message: 'Insufficient coin balance.' });
        }

        userCoin.balance -= Number(amount);
        userCoin.transactions.push({
            type: 'spent',
            amount: Number(amount),
            description,
        });

        await userCoin.save();

        res.status(200).json({ success: true, message: 'Coins spent successfully.' });
    } catch (error) {
        next(error);
    }
};