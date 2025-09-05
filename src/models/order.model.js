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
        // এখানে 'SSLCOMMERZ' যোগ করা হয়েছে
        enum: ['Cash on Delivery', 'Card', 'Mobile Banking', 'SSLCOMMERZ'],
        default: 'Cash on Delivery',
    },
    paymentInfo: {
        status: {
            type: String,
            required: true,
            default: 'Unpaid',
        },
        id: { type: String }
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    orderStatus: {
        type: String,
        required: true,
        // enum-এ নতুন স্ট্যাটাসগুলো যোগ করা হয়েছে
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Failed'],
        default: 'Pending',
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: {
        type: Date,
    },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;