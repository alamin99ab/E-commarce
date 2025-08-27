const Wishlist = require('../models/wishlist.model');

const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
        if (!wishlist) {
            return res.status(200).json({ success: true, products: [] });
        }
        res.status(200).json({ success: true, products: wishlist.products });
    } catch (error) {
        next(error);
    }
};

const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
        } else {
            if (wishlist.products.includes(productId)) {
                return res.status(400).json({ success: false, message: 'Product already in wishlist' });
            }
            wishlist.products.push(productId);
            await wishlist.save();
        }
        res.status(200).json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        next(error);
    }
};

const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        await wishlist.save();

        res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};