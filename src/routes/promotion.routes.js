const express = require('express');
const router = express.Router();
const {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    applyPromotion,
} = require('../controllers/promotion.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// User route
router.post('/apply', protect, applyPromotion);

// Admin routes
router.route('/')
    .post(protect, isAdmin, createPromotion)
    .get(protect, isAdmin, getAllPromotions);

router.route('/:id')
    .get(protect, isAdmin, getPromotionById)
    .put(protect, isAdmin, updatePromotion)
    .delete(protect, isAdmin, deletePromotion);

module.exports = router;