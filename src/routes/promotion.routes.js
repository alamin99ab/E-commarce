const express = require('express');
const router = express.Router();
const {
    createPromotion,
    getActivePromotions,
    applyPromotion,
    deletePromotion
} = require('../controllers/promotion.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// Public route to get all active promotions
router.get('/', getActivePromotions);

// Private route for logged-in users to apply a code
router.post('/apply', protect, applyPromotion);

// Admin-only routes to create and delete promotions
router.post('/', protect, isAdmin, createPromotion);
router.delete('/:id', protect, isAdmin, deletePromotion);

module.exports = router;