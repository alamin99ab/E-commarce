const Promotion = require('../models/promotion.model');

// @desc    Create a new promotion
// @route   POST /api/v1/promotions
// @access  Private/Admin
const createPromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.create(req.body);
        res.status(201).json({ message: 'Promotion created successfully.', promotion });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'This promotion code already exists.' });
        }
        next(error);
    }
};

// @desc    Get all active promotions
// @route   GET /api/v1/promotions
// @access  Public
const getActivePromotions = async (req, res, next) => {
    try {
        const promotions = await Promotion.find({
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });
        res.status(200).json(promotions);
    } catch (error) {
        next(error);
    }
};

// @desc    Validate and apply a promotion code
// @route   POST /api/v1/promotions/apply
// @access  Private
const applyPromotion = async (req, res, next) => {
    const { code, cartTotal } = req.body;
    try {
        const promotion = await Promotion.findOne({
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        if (!promotion) {
            return res.status(404).json({ message: 'Invalid or expired promotion code.' });
        }

        if (cartTotal < promotion.minPurchase) {
            return res.status(400).json({ message: `You need to purchase at least ${promotion.minPurchase} to use this code.` });
        }

        let discount = 0;
        if (promotion.discountType === 'percentage') {
            discount = (cartTotal * promotion.discountValue) / 100;
        } else { // 'fixed'
            discount = promotion.discountValue;
        }

        res.status(200).json({
            message: 'Promotion applied successfully!',
            discountAmount: discount,
            code: promotion.code
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete a promotion
// @route   DELETE /api/v1/promotions/:id
// @access  Private/Admin
const deletePromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found.' });
        }
        res.status(200).json({ message: 'Promotion deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPromotion,
    getActivePromotions,
    applyPromotion,
    deletePromotion
};