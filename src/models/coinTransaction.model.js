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
        enum: ['credit', 'debit']
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        unique: true,
        required: true,
    }
}, {
    timestamps: true
});

const CoinTransaction = mongoose.model('CoinTransaction', coinTransactionSchema);
module.exports = CoinTransaction;