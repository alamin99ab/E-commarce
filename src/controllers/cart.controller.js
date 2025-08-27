const User = require('../models/user.model');
const Product = require('../models/product.model');

// @desc    Get user's shopping cart
// @route   GET /api/v1/cart
// @access  Private
const getCart = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('shoppingCart.product');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user.shoppingCart);
    } catch (error) {
        next(error);
    }
};

// @desc    Add an item to the shopping cart
// @route   POST /api/v1/cart
// @access  Private
const addToCart = async (req, res, next) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const user = await User.findById(req.user.id);
        const cartItemIndex = user.shoppingCart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex > -1) {
            // যদি পণ্যটি কার্টে আগে থেকেই থাকে, তাহলে শুধু তার পরিমাণ (quantity) আপডেট হবে
            user.shoppingCart[cartItemIndex].quantity += quantity;
        } else {
            // যদি পণ্যটি নতুন হয়, তাহলে কার্টে যোগ হবে
            user.shoppingCart.push({ product: productId, quantity });
        }

        await user.save();
        res.status(200).json({ message: 'Item added to cart successfully.', shoppingCart: user.shoppingCart });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove an item from the shopping cart
// @route   DELETE /api/v1/cart/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
    const { productId } = req.params;

    try {
        const user = await User.findById(req.user.id);
        user.shoppingCart = user.shoppingCart.filter(item => item.product.toString() !== productId);

        await user.save();
        res.status(200).json({ message: 'Item removed from cart successfully.', shoppingCart: user.shoppingCart });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear the entire shopping cart
// @route   DELETE /api/v1/cart
// @access  Private
const clearCart = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.shoppingCart = [];

        await user.save();
        res.status(200).json({ message: 'Cart cleared successfully.', shoppingCart: user.shoppingCart });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart
};