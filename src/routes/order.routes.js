const express = require('express');
const router = express.Router();
const {
    createCodOrder,
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getSellerOrders
} = require('../controllers/order.controller');
const { protect, isSeller, isAdmin } = require('../middlewares/auth.middleware');

// =================================================================
//                      CUSTOMER ROUTES
// =================================================================
// POST /api/v1/orders -> Create a new order
router.post('/', protect, createCodOrder);

// GET /api/v1/orders/myorders -> Get logged in user's orders
// দ্রষ্টব্য: /:id এর আগে এই রাউটটি থাকা জরুরি
router.get('/myorders', protect, getMyOrders);

// GET /api/v1/orders/:id -> Get a single order by ID
router.get('/:id', protect, getOrderById);


// =================================================================
//                      SELLER ROUTES
// =================================================================
// GET /api/v1/orders/seller/myorders -> Get orders for a seller
router.get('/seller/myorders', protect, isSeller, getSellerOrders);


// =================================================================
//                      ADMIN ROUTES
// =================================================================
// GET /api/v1/orders -> Get all orders (Admin only)
router.get('/', protect, isAdmin, getAllOrders);

// PUT /api/v1/orders/:id/status -> Update order status (Admin only)
router.put('/:id/status', protect, isAdmin, updateOrderStatus);


module.exports = router;