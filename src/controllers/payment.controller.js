const SSLCommerzPayment = require('sslcommerz-lts');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const store_id = process.env.STORE_ID;
const store_password = process.env.STORE_PASSWORD;
const is_live = false;
const api_url = process.env.API_URL || 'http://localhost:5000';
const client_url = process.env.CLIENT_URL || 'http://localhost:5173';

exports.initPayment = async (req, res) => {
    try {
        const { cartItems, shippingInfo } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found." });
        
        let finalOrderItems = [];
        let calculatedTotalPrice = 0;

        for (const item of cartItems) {
            const productData = await Product.findById(item._id);
            if (!productData) return res.status(404).json({ message: `Product with ID ${item._id} not found.` });

            // **যদি পণ্যের বিক্রেতা না থাকে, তাহলে .env ফাইল থেকে অ্যাডমিন আইডি ব্যবহার করা হবে**
            const sellerId = productData.seller || process.env.ADMIN_USER_ID;
            if (!sellerId) {
                return res.status(400).json({ message: `Product "${productData.name}" has no seller and no default admin is set.` });
            }

            finalOrderItems.push({
                product: productData._id,
                quantity: item.quantity,
                price: productData.price,
                seller: sellerId,
            });
            calculatedTotalPrice += productData.price * item.quantity;
        }

        const transactionId = uuidv4();
        const data = {
            total_amount: calculatedTotalPrice,
            currency: 'BDT',
            tran_id: transactionId,
            success_url: `${api_url}/api/v1/payment/success`,
            fail_url: `${api_url}/api/v1/payment/fail`,
            cancel_url: `${api_url}/api/v1/payment/cancel`,
            ipn_url: '/ipn',
            shipping_method: 'Courier',
            product_name: 'E-commerce Order',
            product_category: 'General',
            product_profile: 'general',
            cus_name: shippingInfo.name,
            cus_email: user.email,
            cus_add1: shippingInfo.address,
            cus_city: shippingInfo.city,
            cus_postcode: shippingInfo.postalCode,
            cus_country: shippingInfo.country,
            cus_phone: shippingInfo.phone || 'N/A',
            ship_name: shippingInfo.name,
            ship_add1: shippingInfo.address,
            ship_city: shippingInfo.city,
            ship_postcode: shippingInfo.postalCode,
            ship_country: shippingInfo.country,
        };
        
        const newOrderData = {
            transactionId,
            user: req.user.id,
            shippingInfo,
            orderItems: finalOrderItems,
            totalPrice: calculatedTotalPrice,
            paymentMethod: 'SSLCOMMERZ', // পেমেন্টের ধরণ নির্দিষ্ট করা
        };

        const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);
        const apiResponse = await sslcz.init(data);

        if (apiResponse.status === 'SUCCESS') {
            const newOrder = new Order(newOrderData);
            await newOrder.save();
            res.status(200).json({ url: apiResponse.GatewayPageURL });
        } else {
            res.status(400).json({ message: 'Failed to initialize payment.' });
        }
    } catch (error) {
        console.error("Payment initialization error:", error);
        res.status(500).json({ message: error.message || 'Server error occurred.' });
    }
};

exports.paymentSuccess = async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate({ transactionId: req.body.tran_id }, { 'paymentInfo.status': 'Paid', 'paymentInfo.id': req.body.bank_tran_id, orderStatus: 'Processing' }, { new: true });
        if(order) res.redirect(`${client_url}/payment/success?transaction_id=${req.body.tran_id}`);
        else res.redirect(`${client_url}/payment/fail`);
    } catch (error) {
        res.redirect(`${client_url}/payment/fail`);
    }
};
exports.paymentFail = async (req, res) => {
    try {
        await Order.deleteOne({ transactionId: req.body.tran_id });
        res.redirect(`${client_url}/payment/fail`);
    } catch (error) {
        res.redirect(`${client_url}/payment/fail`);
    }
};
exports.paymentCancel = async (req, res) => {
    try {
        await Order.deleteOne({ transactionId: req.body.tran_id });
        res.redirect(`${client_url}/payment/fail`);
    } catch (error) {
        res.redirect(`${client_url}/payment/fail`);
    }
};