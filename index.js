const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

// .env ফাইল লোড করার জন্য
dotenv.config();

// --- সব রাউট ইম্পোর্ট করা ---
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


// --- Express অ্যাপ ইনিশিয়ালাইজ করা ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- ডেটাবেস কানেকশন ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB ডেটাবেস সফলভাবে সংযুক্ত হয়েছে।'))
    .catch(err => console.error('❌ MongoDB সংযোগে সমস্যা:', err));

// --- কোর মিডলওয়্যার ---
app.use(helmet()); // নিরাপত্তা বৃদ্ধি করার জন্য
app.use(cors()); // ক্রস-অরিজিন অনুরোধ চালু করার জন্য
app.use(express.json()); // JSON বডি পার্স করার জন্য (body-parser এর পরিবর্তে)
app.use(express.urlencoded({ extended: true })); // URL-encoded বডি পার্স করার জন্য

// --- Passport মিডলওয়্যার ---
app.use(passport.initialize());
require('./src/config/passport-setup'); // Passport এর কৌশলগুলো কনফিগার করা

// --- HTTP রিকোয়েস্ট লগার ---
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --- এপিআই রাউট ব্যবহার করা ---
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

// --- ওয়েলকাম রুট ---
app.get('/', (req, res) => {
    res.send('🏠 এপিআই সার্ভার সফলভাবে চলছে!');
});

// --- গ্লোবাল এরর হ্যান্ডলার ---
app.use((err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'সার্ভারে একটি অপ্রত্যাশিত সমস্যা হয়েছে।',
        // শুধুমাত্র ডেভেলপমেন্ট মোডে স্ট্যাক ট্রেস দেখানো হবে
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});

// --- সার্ভার চালু করা ---
app.listen(PORT, () => {
    console.log(`🚀 সার্ভারটি http://localhost:${PORT} -এ চলছে`);
});