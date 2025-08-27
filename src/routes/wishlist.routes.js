const express = require('express');
const router = express.Router();
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} = require('../controllers/wishlist.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect); // এই রুটের সব কাজের জন্য লগইন করা আবশ্যক

router.route('/')
    .get(getWishlist)
    .post(addToWishlist);

router.route('/:productId')
    .delete(removeFromWishlist);

module.exports = router;