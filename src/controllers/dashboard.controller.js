const User = require('../models/user.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

// @desc    Get statistics for the admin dashboard
// @route   GET /api/v1/dashboard
// @access  Private/Admin
const getAdminDashboardStats = async (req, res, next) => {
    try {
        // মোট ব্যবহারকারীর সংখ্যা গণনা
        const totalUsers = await User.countDocuments();

        // মোট পণ্যের সংখ্যা গণনা
        const totalProducts = await Product.countDocuments();

        // মোট অর্ডারের সংখ্যা গণনা
        const totalOrders = await Order.countDocuments();

        // মোট বিক্রয়ের পরিমাণ গণনা
        const totalSalesResult = await Order.aggregate([
            {
                $group: {
                    _id: null, // সব ডকুমেন্টকে একটি গ্রুপে আনা হচ্ছে
                    totalRevenue: { $sum: '$totalPrice' } // totalPrice ফিল্ডের যোগফল
                }
            }
        ]);

        const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalRevenue : 0;

        // সর্বশেষ কয়েকটি অর্ডার
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        res.status(200).json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalSales,
            recentOrders
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminDashboardStats
};