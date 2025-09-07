const User = require('../models/user.model');
const CoinTransaction = require('../models/coinTransaction.model');
const crypto = require('crypto');

const getCoinBalance = async (req, res, next) => {
    try {
        res.status(200).json({
            coinBalance: req.user.coinBalance
        });
    } catch (error) {
        next(error);
    }
};

const getCoinHistory = async (req, res, next) => {
    try {
        const transactions = await CoinTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};

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

        user.coinBalance += Number(amount);

        await CoinTransaction.create({
            user: userId,
            type: 'credit',
            amount: Number(amount),
            description: description,
            transactionId: crypto.randomBytes(16).toString('hex')
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