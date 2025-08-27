const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            seller: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User',
            },
        },
    ],
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        phoneNo: { type: String, required: true },
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash on Delivery', 'Card', 'Mobile Banking'],
        default: 'Cash on Delivery',
    },
    paymentInfo: {
        status: {
            type: String,
            required: true,
            default: 'Unpaid',
        },
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing',
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    deliveredAt: {
        type: Date,
    },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;