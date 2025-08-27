const Product = require('../models/product.model');
const User = require('../models/user.model');

const getMyProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ seller: req.user._id })
            .populate('category', 'name');
        res.status(200).json({ success: true, products });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const product = new Product({
            ...req.body,
            seller: req.user._id
        });
        const createdProduct = await product.save();
        res.status(201).json({ success: true, product: createdProduct });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to create product.', error: error.message });
    }
};

const getAllProducts = async (req, res, next) => {
    try {
        const { keyword, category, minPrice, maxPrice, rating, sort } = req.query;
        const filter = {};

        if (keyword) {
            filter.name = { $regex: keyword, $options: 'i' };
        }
        if (category) {
            filter.category = category;
        }
        if (minPrice && maxPrice) {
            filter.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
        }
        if (rating) {
            filter.rating = { $gte: Number(rating) };
        }

        let sortOption = {};
        if (sort === 'price-asc') {
            sortOption = { price: 1 };
        } else if (sort === 'price-desc') {
            sortOption = { price: -1 };
        } else {
            sortOption = { createdAt: -1 };
        }

        const products = await Product.find(filter)
            .populate('category', 'name')
            .populate('seller', 'name businessName')
            .sort(sortOption);

        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching products.', error: error.message });
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate({
                path: 'reviews.user',
                select: 'name'
            });

        if (product) {
            res.status(200).json({ success: true, product: product });
        } else {
            res.status(404).json({ success: false, message: 'Product not found.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching product details.', error: error.message });
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to update this product.' });
        }
        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
        res.status(400).json({ message: 'Failed to update product.', error: error.message });
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this product.' });
        }
        await Product.deleteOne({ _id: req.params.id });
        res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product.', error: error.message });
    }
};

const createProductReview = async (req, res, next) => {
    const { rating, comment } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this product.' });
        }
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        await product.save();
        res.status(201).json({ message: 'Review added successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add review.', error: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProductReview,
    getMyProducts,
};