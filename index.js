const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const categoryRoutes = require('./src/routes/category.routes');
const productRoutes = require('./src/routes/product.routes');
const orderRoutes = require('./src/routes/order.routes');
const coinRoutes = require('./src/routes/coin.routes');
const cartRoutes = require('./src/routes/cart.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const promotionRoutes = require('./src/routes/promotion.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const wishlistRoutes = require('./src/routes/wishlist.routes');
const withdrawalRoutes = require('./src/routes/withdrawal.routes');
const pageRoutes = require('./src/routes/page.routes');
const applicationRoutes = require('./src/routes/application.routes');
const uploadRoutes = require('./src/routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB database connected successfully.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
require('./src/config/passport-setup');

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/coins', coinRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/withdrawal', withdrawalRoutes);
app.use('/api/v1/pages', pageRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('🏠 API server is running successfully!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'An unexpected error occurred on the server.',
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Error: ${err.message}`);
    server.close(() => process.exit(1));
});