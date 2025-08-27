const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProductReview,
    getMyProducts
} = require('../controllers/product.controller');
const { protect, isSeller, isSellerApproved } = require('../middlewares/auth.middleware');

router.get('/', getAllProducts);
router.post('/', protect, isSeller, isSellerApproved, createProduct);

router.get('/my-products', protect, isSeller, getMyProducts);

router.get('/:id', getProductById);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;