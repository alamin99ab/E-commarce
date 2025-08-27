const express = require('express');
const passport = require('passport');
const {
    register,
    login,
    verifyEmail,
    googleCallback,
    setupTwoFactor,
    verifyAndEnableTwoFactor,
    validateLoginTwoFactor
} = require('../controllers/auth.controller');
// Corrected path below
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// --- Standard Authentication ---
router.post('/register', register);
router.post('/login', login);
router.post('/login/2fa', validateLoginTwoFactor);
router.get('/verify-email/:token', verifyEmail);

// --- Google Authentication ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

// --- Two-Factor Authentication (for Admins) ---
router.get('/2fa/setup', protect, setupTwoFactor);
router.post('/2fa/verify', protect, verifyAndEnableTwoFactor);

module.exports = router;