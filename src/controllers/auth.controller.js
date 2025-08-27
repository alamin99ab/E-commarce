const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../config/nodemailer');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// --- Helper Function to Generate JWT ---
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// --- User Registration ---
exports.register = async (req, res, next) => {
    const { name, email, password, role, businessName } = req.body;

    // নিশ্চিত করুন যে ইমেইল পাওয়া গেছে
    if (!email) {
        return res.status(400).json({ message: "Email is required for registration." });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const user = await User.create({ name, email, password, role, businessName });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        await user.save({ validateBeforeSave: false }); // টোকেন যোগ করার জন্য সেভ করুন

        const verificationURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
        const emailHtml = `<p>Welcome to Gramroot! Please verify your email by clicking on the link: <a href="${verificationURL}">Verify Email</a></p>`;

        // ডিবাগ করার জন্য লগ
        console.log("Sending verification email to:", user.email);

        await sendEmail({
            email: user.email,
            subject: 'Verify Your Email Address',
            html: emailHtml,
        });

        res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });

    } catch (error) {
        console.error("Error during registration:", error); // সম্পূর্ণ এররটি দেখার জন্য
        next(error);
    }
};

// --- Email Verification ---
exports.verifyEmail = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({ verificationToken: hashedToken });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token." });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
        next(error);
    }
};

// --- User Login ---
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password'); // পাসওয়ার্ড সিলেক্ট করুন

        if (!user || !(await user.isPasswordCorrect(password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email before logging in." });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Your account is currently inactive." });
        }

        // --- 2FA Check for Admins ---
        if (user.role === 'admin' && user.isTwoFactorEnabled) {
            return res.status(200).json({
                twoFactorRequired: true,
                userId: user._id,
                message: "Please provide your 2FA token to complete login."
            });
        }

        const token = generateToken(user._id, user.role);
        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        next(error);
    }
};

// --- Google Auth Callback ---
exports.googleCallback = (req, res) => {
    const token = generateToken(req.user._id, req.user.role);
    // ইউজারকে টোকেনসহ ফ্রন্টএন্ডে রিডাইরেক্ট করুন
    res.redirect(`${process.env.FRONTEND_URL}/login/success?token=${token}`);
};

// --- 2FA Setup (Admin only) ---
exports.setupTwoFactor = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can set up 2FA." });
    }
    try {
        const secret = speakeasy.generateSecret({ name: `Gramroot:${req.user.email}` });
        req.user.twoFactorSecret = secret.base32;
        await req.user.save({ validateBeforeSave: false });

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) return next(err);
            res.status(200).json({ qrCode: data_url, secret: secret.base32 });
        });
    } catch (error) {
        next(error);
    }
};

// --- 2FA Verification and Enabling (Admin only) ---
exports.verifyAndEnableTwoFactor = async (req, res, next) => {
    const { token } = req.body;
    try {
        const verified = speakeasy.totp.verify({
            secret: req.user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (verified) {
            req.user.isTwoFactorEnabled = true;
            await req.user.save({ validateBeforeSave: false });
            res.status(200).json({ message: "2FA has been enabled successfully." });
        } else {
            res.status(400).json({ message: "Invalid 2FA token." });
        }
    } catch (error) {
        next(error);
    }
};

// --- Validate 2FA Token on Login (Admin only) ---
exports.validateLoginTwoFactor = async (req, res, next) => {
    const { userId, token } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (verified) {
            const authToken = generateToken(user._id, user.role);
            res.status(200).json({
                token: authToken,
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            res.status(401).json({ message: "Invalid 2FA token." });
        }
    } catch (error) {
        next(error);
    }
};