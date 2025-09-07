const Promotion = require('../models/promotion.model');

// @desc    Create a new promotion
// @route   POST /api/v1/promotions
// @access  Private/Admin
const createPromotion = async (req, res, next) => {
    try {
        const { promoCode, discountType, discountValue, description, startDate, endDate, usageLimit } = req.body;

        const promotionExists = await Promotion.findOne({ promoCode: promoCode.toUpperCase() });

        if (promotionExists) {
            return res.status(400).json({ success: false, message: 'A promotion with this code already exists.' });
        }

        const promotion = await Promotion.create({
            promoCode,
            discountType,
            discountValue,
            description,
            startDate,
            endDate,
            usageLimit,
        });

        res.status(201).json({ success: true, data: promotion });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all promotions
// @route   GET /api/v1/promotions
// @access  Private/Admin
const getAllPromotions = async (req, res, next) => {
    try {
        const promotions = await Promotion.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: promotions.length, data: promotions });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single promotion by ID
// @route   GET /api/v1/promotions/:id
// @access  Private/Admin
const getPromotionById = async (req, res, next) => {
    try {
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found.' });
        }

        res.status(200).json({ success: true, data: promotion });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a promotion
// @route   PUT /api/v1/promotions/:id
// @access  Private/Admin
const updatePromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found.' });
        }

        res.status(200).json({ success: true, data: promotion });
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
            return res.status(404).json({ success: false, message: 'Promotion not found.' });
        }

        res.status(200).json({ success: true, message: 'Promotion deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Apply a promotion code
// @route   POST /api/v1/promotions/apply
// @access  Private
const applyPromotion = async (req, res, next) => {
    try {
        const { promoCode } = req.body;

        if (!promoCode) {
            return res.status(400).json({ success: false, message: 'Promo code is required.' });
        }

        const promotion = await Promotion.findOne({ promoCode: promoCode.toUpperCase() });

        if (!promotion || !promotion.isActive) {
            return res.status(404).json({ success: false, message: 'Invalid or inactive promo code.' });
        }

        const now = new Date();
        if (now < promotion.startDate || now > promotion.endDate) {
            return res.status(400).json({ success: false, message: 'Promo code is expired or not yet active.' });
        }

        if (promotion.usageLimit !== null && promotion.timesUsed >= promotion.usageLimit) {
            return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit.' });
        }

        res.status(200).json({
            success: true,
            message: 'Promo code applied successfully.',
            data: {
                discountType: promotion.discountType,
                discountValue: promotion.discountValue,
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    applyPromotion,
};