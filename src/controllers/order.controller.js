const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { v4: uuidv4 } = require('uuid');

// --- ক্যাশ অন ডেলিভারি অর্ডার তৈরির জন্য নতুন কন্ট্রোলার ---
const createCodOrder = async (req, res, next) => {
    try {
        const { cartItems, shippingInfo, totalPrice } = req.body;

        let finalOrderItems = [];
        for (const item of cartItems) {
            const productData = await Product.findById(item._id);
            // বিক্রেতা না থাকলে অ্যাডমিনকে ডিফল্ট বিক্রেতা হিসেবে সেট করা
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
            totalPrice,
            paymentMethod: 'Cash on Delivery',
            orderStatus: 'Processing',
            paymentInfo: { status: 'Unpaid' },
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order,
        });
    } catch (error) {
        next(error);
    }
};

// --- আপনার পুরনো কন্ট্রোলার ফাংশনগুলো ---
const createOrder = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items provided.' });
        }
        const order = new Order({
            user: req.user._id, orderItems, shippingAddress, paymentMethod,
            itemsPrice, shippingPrice, totalPrice,
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
        if (!order) return res.status(404).json({ message: 'Order not found.' });
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

// **সব ফাংশন একসাথে এক্সপোর্ট করা হচ্ছে**
module.exports = {
    createOrder,
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    createCodOrder, // <-- নতুন ফাংশনটি এখানে যোগ করা হয়েছে
};