const Order = require('../models/order.model'); // <-- ঠিক করা হয়েছে
const Product = require('../models/product.model'); // <-- ঠিক করা হয়েছে
const User = require('../models/user.model'); // <-- ঠিক করা হয়েছে
const SSLCommerzPayment = require('sslcommerz-lts');
const { v4: uuidv4 } = require('uuid');

// ============================================================
//               Initialize Online Payment (SSL Commerz)
// ============================================================
const initPayment = async (req, res, next) => {
    try {
        const { orderItems, shippingInfo } = req.body;
        const user = await User.findById(req.user.id);

        if (!orderItems || !shippingInfo || !user) {
            return res.status(400).json({ message: "অর্ডারের জন্য প্রয়োজনীয় তথ্য পাওয়া যায়নি।" });
        }

        const totalPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        if (totalPrice <= 0) {
            return res.status(400).json({ message: "কার্ট খালি রাখা যাবে না।" });
        }

        const transactionId = `gramroot_${uuidv4().slice(0, 15)}`;

        const data = {
            total_amount: totalPrice,
            currency: 'BDT',
            tran_id: transactionId,
            success_url: `${process.env.FRONTEND_URL}/payment/success?transactionId=${transactionId}`,
            fail_url: `${process.env.FRONTEND_URL}/payment/fail`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            ipn_url: '/ipn',
            shipping_method: 'Courier',
            product_name: 'GramRoot Various Products',
            product_category: 'E-commerce',
            product_profile: 'general',
            cus_name: user.name,
            cus_email: user.email,
            cus_add1: shippingInfo.address,
            cus_city: shippingInfo.city,
            cus_state: shippingInfo.city,
            cus_postcode: shippingInfo.postalCode,
            cus_country: 'Bangladesh',
            cus_phone: shippingInfo.phoneNo,
            ship_name: user.name,
            ship_add1: shippingInfo.address,
            ship_city: shippingInfo.city,
            ship_state: shippingInfo.city,
            ship_postcode: shippingInfo.postalCode,
            ship_country: 'Bangladesh',
        };

        const order = new Order({
            transactionId,
            user: req.user.id,
            shippingInfo,
            orderItems,
            totalPrice,
            paymentMethod: 'Online',
            paymentInfo: { status: 'Pending' },
        });

        await order.save();

        const sslcz = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASSWORD, false);
        const apiResponse = await sslcz.init(data);

        if (apiResponse.status === 'SUCCESS' && apiResponse.GatewayPageURL) {
            res.status(200).json({ success: true, url: apiResponse.GatewayPageURL });
        } else {
            res.status(400).json({ success: false, message: "পেমেন্ট শুরু করা যায়নি।", error: apiResponse });
        }
    } catch (error) {
        next(error);
    }
};

// ============================================================
//               Create Cash on Delivery Order
// ============================================================
const createCodOrder = async (req, res, next) => {
    try {
        const { orderItems, shippingInfo, totalPrice, coinsToUse = 0 } = req.body;
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
            if (product.stock < item.quantity) {
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
            shippingInfo,
            orderItems,
            totalPrice: finalPrice,
            paymentMethod: 'Cash on Delivery',
            orderStatus: 'Processing',
            paymentInfo: { status: 'Unpaid' },
        });

        for (const item of orderItems) {
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

const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
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
            if (req.body.status === 'Delivered') {
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
            .populate('user', 'name email')
            .populate('orderItems.product', 'name')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    initPayment,
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    createCodOrder,
    getSellerOrders,
};