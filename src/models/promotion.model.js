const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    promoCode: {
        type: String,
        required: [true, 'Promo code is required.'],
        unique: true,
        trim: true,
        uppercase: true, // কোড সবসময় বড় হাতের অক্ষরে থাকবে
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'], // ডিসকাউন্ট শতাংশে নাকি নির্দিষ্ট টাকায়
        default: 'percentage',
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required.'],
        min: [0, 'Discount value cannot be negative.'],
    },
    description: {
        type: String,
        required: [true, 'Description is required.'],
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required.'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required.'],
    },
    usageLimit: {
        type: Number,
        default: null, // null মানে অসীম ব্যবহার
    },
    timesUsed: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
    // নিশ্চিত করবে যেন end date সবসময় start date এর পরে হয়
    validateBeforeSave: true,
    schema: {
        assert: function() {
            return this.endDate > this.startDate;
        },
        message: 'End date must be after start date.'
    }
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;