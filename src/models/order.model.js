const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        phoneNo: { type: String },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            seller: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true,
            },
        },
    ],
    // **নতুন ফিল্ড যোগ করা হয়েছে**
    paymentMethod: {
        type: String,
        required: true,
        enum: ['SSLCOMMERZ', 'Cash on Delivery'],
        default: 'SSLCOMMERZ',
    },
    paymentInfo: {
        id: { type: String },
        status: { type: String, required: true, default: 'Pending' },
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Pending',
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);