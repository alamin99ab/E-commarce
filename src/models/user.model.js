const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    googleId: {
        type: String,
    },
    password: {
        type: String,
        required: function() { return !this.googleId; }
    },
    role: {
        type: String,
        enum: ['customer', 'seller', 'admin'],
        default: 'customer',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
    twoFactorSecret: {
        type: String,
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: function() {
            return this.role === 'seller' ? 'pending' : 'approved';
        }
    },
    businessName: {
        type: String,
        trim: true
    },
    businessLogo: {
        type: String,
    },
    paymentDetails: {
        bankName: String,
        accountNumber: String,
        accountHolderName: String,
        mobileBankingNumber: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    address: {
        street: String,
        city: String,
        zipCode: String,
    },
    coinBalance: {
        type: Number,
        default: 0,
    },
    shoppingCart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    }]
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    if (this.googleId || !this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;