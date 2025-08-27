// File: backend/src/controllers/withdrawal.controller.js

const Withdrawal = require('../models/withdrawal.model');
const User = require('../models/user.model');
const Order = require('../models/order.model');

const createWithdrawalRequest = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const sellerId = req.user.id;

        const orders = await Order.find({ "orderItems.seller": sellerId, "orderStatus": "Delivered" });
        let totalEarnings = 0;
        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.seller.toString() === sellerId) {
                    totalEarnings += item.price * item.quantity;
                }
            });
        });

        const previousWithdrawals = await Withdrawal.find({ seller: sellerId, status: 'Completed' });
        const totalWithdrawn = previousWithdrawals.reduce((acc, w) => acc + w.amount, 0);

        const availableBalance = totalEarnings - totalWithdrawn;

        if (amount > availableBalance) {
            return res.status(400).json({ success: false, message: `Insufficient balance. You can withdraw up to ${availableBalance}.` });
        }

        const withdrawal = await Withdrawal.create({
            seller: sellerId,
            amount,
        });

        res.status(201).json({ success: true, message: 'Withdrawal request submitted successfully.', withdrawal });

    } catch (error) {
        next(error);
    }
};

const getAllWithdrawalRequests = async (req, res, next) => {
    try {
        const withdrawals = await Withdrawal.find({}).populate('seller', 'name email businessName');
        res.status(200).json({ success: true, withdrawals });
    } catch (error) {
        next(error);
    }
};

const updateWithdrawalStatus = async (req, res, next) => {
    try {
        const { status, transactionId } = req.body;
        const withdrawal = await Withdrawal.findById(req.params.id);

        if (!withdrawal) {
            return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
        }

        withdrawal.status = status;
        if (transactionId) {
            withdrawal.transactionId = transactionId;
        }

        await withdrawal.save();

        res.status(200).json({ success: true, message: 'Withdrawal status updated.', withdrawal });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createWithdrawalRequest,
    getAllWithdrawalRequests,
    updateWithdrawalStatus,
};