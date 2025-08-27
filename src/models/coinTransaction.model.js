const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        required: true,
        enum: ['credit', 'debit'] // credit মানে কয়েন জমা হওয়া, debit মানে খরচ হওয়া
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    transactionId: { // প্রতিটি লেনদেনের জন্য একটি ইউনিক আইডি
        type: String,
        unique: true,
        required: true,
    }
}, {
    timestamps: true
});

const CoinTransaction = mongoose.model('CoinTransaction', coinTransactionSchema);

module.exports = CoinTransaction;