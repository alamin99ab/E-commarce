const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');

// createCodOrder ফাংশন অপরিবর্তিত
const createCodOrder = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, totalPrice, coinsToUse = 0 } = req.body;
        const user = await User.findById(req.user.id);

        if (coinsToUse > 0) {
            if (user.coinBalance < coinsToUse) {
                return res.status(400).json({ success: false, message: "You don't have enough coins." });
            }
            if (coinsToUse > totalPrice) {
                return res.status(400).json({ success: false, message: "You cannot use more coins than the order total." });
            }
        }
        
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found.` });
            }
            if (product.stock < item.qty) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product.name}. Available stock: ${product.stock}`,
                });
            }
        }

        const finalPrice = totalPrice - coinsToUse;

        const order = await Order.create({
            transactionId: `COD-${uuidv4()}`,
            user: req.user.id,
            shippingAddress,
            orderItems,
            totalPrice: finalPrice,
            paymentMethod: 'Cash on Delivery',
            orderStatus: 'Processing',
        });

        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.qty },
            });
        }

        const coinsEarned = Math.floor(finalPrice * 0.1);
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { coinBalance: coinsEarned - coinsToUse },
        });

        res.status(201).json({
            success: true,
            message: `Order placed successfully! You used ${coinsToUse} coins and earned ${coinsEarned} coins.`,
            order,
        });
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

const getMyOrders = async (req, res, next) => {
    try {
        // .sort() সরানো হয়েছে
        const orders = await Order.find({ user: req.user._id });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    try {
        // .sort() সরানো হয়েছে
        const orders = await Order.find({}).populate('user', 'id name');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.orderStatus = req.body.status || order.orderStatus;
            if(req.body.status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            const updatedOrder = await order.save();
            res.status(200).json({ success: true, order: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found.' });
        }
    } catch (error) {
        next(error);
    }
};

const getSellerOrders = async (req, res, next) => {
    try {
        const sellerId = req.user.id;
        const orders = await Order.find({ "orderItems.seller": sellerId })
            .populate('user', 'name email');
            
        if (!orders) {
            return res.status(200).json({ success: true, orders: [] });
        }
        
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    createCodOrder,
    getSellerOrders,
};