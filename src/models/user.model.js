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
        required: function() { return !this.googleId; } // Required only if not a Google login user
    },
    role: {
        type: String,
        enum: ['customer', 'seller', 'admin'],
        default: 'customer',
    },
    // For email verification
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
    // For Two-Factor Authentication (Admins)
    twoFactorSecret: {
        type: String,
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    // Seller specific fields
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
    // Generic user fields
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

// Hash password before saving
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

// Method to check password correctness
userSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    if (this.googleId || !this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;