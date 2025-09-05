const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');

const createCodOrder = async (req, res, next) => {
    try {
        const { cartItems, shippingInfo, totalPrice, coinsToUse = 0 } = req.body;
        const user = await User.findById(req.user.id);

        if (coinsToUse > 0) {
            if (user.coinBalance < coinsToUse) {
                return res.status(400).json({ success: false, message: "You don't have enough coins." });
            }
            if (coinsToUse > totalPrice) {
                return res.status(400).json({ success: false, message: "You cannot use more coins than the order total." });
            }
        }

        for (const item of cartItems) {
            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found.` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product.name}. Available stock: ${product.stock}`,
                });
            }
        }

        const finalPrice = totalPrice - coinsToUse;

        let finalOrderItems = [];
        for (const item of cartItems) {
            const productData = await Product.findById(item._id);
            const sellerId = productData.seller || process.env.ADMIN_USER_ID;
            if (!sellerId) {
                return res.status(400).json({ message: `Product "${productData.name}" is missing a seller.` });
            }
            finalOrderItems.push({
                product: productData._id,
                quantity: item.quantity,
                price: productData.price,
                seller: sellerId,
            });
        }

        const order = await Order.create({
            transactionId: `COD-${uuidv4()}`,
            user: req.user.id,
            shippingInfo,
            orderItems: finalOrderItems,
            totalPrice: finalPrice,
            paymentMethod: 'Cash on Delivery',
            orderStatus: 'Processing',
            paymentInfo: { status: 'Unpaid' },
        });

        for (const item of finalOrderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
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

const createOrder = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items provided.' });
        }
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
        });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order.' });
        }
        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};

const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.orderStatus = req.body.status || order.orderStatus;
            const updatedOrder = await order.save();
            res.status(200).json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found.' });
        }
    } catch (error) {
        next(error);
    }
};

const getSellerOrders = async (req, res, next) => {
    try {
        const sellerId = req.user.id;
        const orders = await Order.find({ "orderItems.seller": sellerId })
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images');

        if (!orders) {
            return res.status(200).json({ success: true, orders: [] });
        }
        
        const sellerOrders = orders.map(order => {
            const sellerItems = order.orderItems.filter(item => item.seller.toString() === sellerId);
            return {
                _id: order._id,
                user: order.user,
                shippingInfo: order.shippingInfo,
                totalPrice: order.totalPrice,
                orderStatus: order.orderStatus,
                createdAt: order.createdAt,
                items: sellerItems
            };
        });

        res.status(200).json({ success: true, orders: sellerOrders });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    createCodOrder,
    getSellerOrders,
};