const passport = require('passport');

const protect = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Unauthorized: Access is denied due to invalid credentials.' });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: 'Forbidden: Your account is currently inactive.' });
        }
        req.user = user;
        return next();
    })(req, res, next);
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: This action is reserved for administrators.' });
    }
};

const isSeller = (req, res, next) => {
    if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: This action is reserved for sellers.' });
    }
};

const isSellerApproved = (req, res, next) => {
    if (req.user.role === 'admin' || (req.user.role === 'seller' && req.user.approvalStatus === 'approved')) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Your seller account is not yet approved.' });
    }
};

module.exports = {
    protect,
    isAdmin,
    isSeller,
    isSellerApproved
};