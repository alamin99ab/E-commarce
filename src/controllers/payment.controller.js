const SSLCommerzPayment = require('sslcommerz-lts');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const store_id = process.env.STORE_ID;
const store_password = process.env.STORE_PASSWORD;
const is_live = process.env.IS_LIVE === 'true';
const api_url = process.env.API_URL || 'http://localhost:5000';
const client_url = process.env.CLIENT_URL || 'http://localhost:3000';

exports.initPayment = async (req, res, next) => {
    try {
        const { cartItems, shippingInfo, totalPrice } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found." });
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty." });
        }

        let orderItemsForDB = [];
        for (const item of cartItems) {
            const product = await Product.findById(item.product).select('name price imageUrl seller stock');
            if (!product) {
                return res.status(404).json({
                    success: false, message: `Invalid item in cart. Please clear your cart and try again.`,
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false, message: `Not enough stock for ${product.name}.`,
                });
            }
            orderItemsForDB.push({
                product: item.product, name: product.name, quantity: item.quantity,
                price: product.price, imageUrl: product.imageUrl, seller: product.seller,
            });
        }
        
        const transactionId = `trans-${uuidv4()}`;
        const data = {
            total_amount: totalPrice,
            currency: 'BDT',
            tran_id: transactionId,
            success_url: `${api_url}/api/v1/payment/success`,
            fail_url: `${api_url}/api/v1/payment/fail`,
            cancel_url: `${api_url}/api/v1/payment/cancel`,
            ipn_url: `${api_url}/api/v1/payment/ipn`,
            shipping_method: 'Courier',
            product_name: 'E-commerce Order',
            product_category: 'General',
            product_profile: 'general',
            cus_name: user.name,
            cus_email: user.email,
            cus_add1: shippingInfo.address,
            cus_city: shippingInfo.city,
            cus_postcode: shippingInfo.postalCode || '1200',
            cus_country: 'Bangladesh',
            cus_phone: shippingInfo.phoneNo,
        };

        const newOrder = new Order({
            transactionId, user: req.user.id, shippingInfo,
            orderItems: orderItemsForDB, totalPrice,
            paymentMethod: 'SSLCOMMERZ', orderStatus: 'Pending',
        });
        await newOrder.save();

        const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);
        const apiResponse = await sslcz.init(data);

        if (apiResponse.status === 'SUCCESS') {
            res.status(200).json({ url: apiResponse.GatewayPageURL });
        } else {
            await Order.deleteOne({ transactionId });
            res.status(400).json({ message: 'Failed to initialize payment.' });
        }
    } catch (error) {
        next(error);
    }
};

exports.paymentSuccess = async (req, res, next) => {
    const tran_id = req.body.tran_id;
    res.redirect(`${client_url}/payment/success?transaction_id=${tran_id}`);
};

exports.paymentFail = async (req, res, next) => {
    try {
        const tran_id = req.body.tran_id;
        await Order.findOneAndUpdate({ transactionId: tran_id }, { orderStatus: 'Failed' });
        res.redirect(`${client_url}/payment/fail`);
    } catch (error) {
        next(error);
    }
};

exports.paymentCancel = async (req, res, next) => {
    try {
        const tran_id = req.body.tran_id;
        await Order.findOneAndUpdate({ transactionId: tran_id }, { orderStatus: 'Cancelled' });
        res.redirect(`${client_url}/payment/fail`);
    } catch (error) {
        next(error);
    }
};

exports.paymentIpn = async (req, res, next) => {
    try {
        const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);
        const isValid = await sslcz.validate(req.body);

        if (isValid) {
            const tran_id = req.body.tran_id;
            const order = await Order.findOneAndUpdate({ transactionId: tran_id }, {
                paymentInfo: { status: 'Paid', id: req.body.bank_tran_id },
                orderStatus: 'Processing',
            });
            
            if(order) {
                for (const item of order.orderItems) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: -item.quantity },
                    });
                }
            }
        }
        res.status(200).send();
    } catch (error) {
        next(error);
    }
};