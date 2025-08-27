const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    createCodOrder // <-- নতুন ফাংশনটি এখানে ইম্পোর্ট করা হয়েছে
} = require('../controllers/order.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware'); // আপনার middleware অনুযায়ী 'protect' ব্যবহার করা হয়েছে

// --- ক্যাশ অন ডেলিভারি অর্ডার তৈরির জন্য নতুন রুট ---
router.post('/cod', protect, createCodOrder);

// --- আপনার পুরনো রুটগুলো ---
router.route('/')
    .post(protect, createOrder)
    .get(protect, isAdmin, getAllOrders);

router.route('/myorders')
    .get(protect, getMyOrders);

router.route('/:id')
    .get(protect, getOrderById);

router.route('/:id/status')
    .put(protect, isAdmin, updateOrderStatus);

module.exports = router;