const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Promotion code is required.'],
        unique: true,
        trim: true,
        uppercase: true // কোড সবসময় বড় হাতের অক্ষরে থাকবে
    },
    description: {
        type: String,
        required: true,
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'] // ডিসকাউন্ট শতাংশে বা নির্দিষ্ট পরিমাণে হতে পারে
    },
    discountValue: {
        type: Number,
        required: true
    },
    minPurchase: { // সর্বনিম্ন কত টাকার কেনাকাটা করলে এই কোড ব্যবহার করা যাবে
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;