const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const getAdminDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalSellers = await User.countDocuments({ role: 'seller' });
        const totalProducts = await Product.countDocuments();

        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        
        const latestOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalSellers,
                totalProducts,
                totalRevenue: orderStats[0]?.totalRevenue || 0,
                totalOrders: orderStats[0]?.totalOrders || 0,
                monthlyRevenue,
                latestOrders
            }
        });
    } catch (error) {
        next(error);
    }
};

const getSellerDashboardStats = async (req, res, next) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user.id);

        const totalProducts = await Product.countDocuments({ seller: sellerId });

        const sellerOrderStats = await Order.aggregate([
            { $unwind: "$orderItems" },
            { $match: { "orderItems.seller": sellerId } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
                    totalOrders: { $addToSet: "$_id" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    totalOrders: { $size: "$totalOrders" }
                }
            }
        ]);

        const latestOrders = await Order.find({ "orderItems.seller": sellerId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('user shippingInfo totalPrice orderStatus createdAt');

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalRevenue: sellerOrderStats[0]?.totalRevenue || 0,
                totalOrders: sellerOrderStats[0]?.totalOrders || 0,
                latestOrders
            }
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAdminDashboardStats,
    getSellerDashboardStats,
};