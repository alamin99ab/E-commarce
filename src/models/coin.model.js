const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['earned', 'spent'], // কয়েন অর্জন করা হয়েছে নাকি খরচ করা হয়েছে
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String, // যেমন: "Daily Login Bonus", "Used for discount"
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const coinSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // একজন ইউজারের জন্য একটিই কয়েন ডকুমেন্ট থাকবে
    },
    balance: {
        type: Number,
        default: 0, 
    },
    transactions: [coinTransactionSchema], // সকল লেনদেনের ইতিহাস
});

const Coin = mongoose.model('Coin', coinSchema);
module.exports = Coin;