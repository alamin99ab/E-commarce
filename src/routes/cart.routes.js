const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    removeFromCart,
    clearCart
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

// এই লাইনের মাধ্যমে নিচের সব রাউট সুরক্ষিত করা হলো
// এখন শুধুমাত্র লগইন করা ব্যবহারকারীরাই এই রাউটগুলো ব্যবহার করতে পারবে
router.use(protect);

router.route('/')
    .get(getCart)
    .post(addToCart)
    .delete(clearCart);

router.route('/:productId')
    .delete(removeFromCart);

module.exports = router;