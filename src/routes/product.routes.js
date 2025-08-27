const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProductReview,
    getMyProducts // <-- নতুন ফাংশনটি এখানে ইম্পোর্ট করা হয়েছে
} = require('../controllers/product.controller');
const { protect, isSeller, isSellerApproved } = require('../middlewares/auth.middleware');

// --- আপনার আগের সঠিক রুটগুলো ---
router.get('/', getAllProducts);
router.post('/', protect, isSeller, isSellerApproved, createProduct);

// --- নতুন রুট: বিক্রেতার নিজের পণ্যগুলো পাওয়ার জন্য ---
router.get('/my-products', protect, isSeller, getMyProducts);

router.get('/:id', getProductById);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;