const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    createCodOrder,
    getSellerOrders
} = require('../controllers/order.controller');
const { protect, isSeller, isAdmin } = require('../middlewares/auth.middleware');

// Customer Routes
router.post('/', protect, createCodOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Seller Route
router.get('/seller/my-orders', protect, isSeller, getSellerOrders);

// Admin Routes
router.get('/', protect, isAdmin, getAllOrders);
router.put('/status/:id', protect, isAdmin, updateOrderStatus);

module.exports = router;