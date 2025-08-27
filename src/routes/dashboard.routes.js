const express = require('express');
const router = express.Router();
const { getAdminDashboardStats, getSellerDashboardStats } = require('../controllers/dashboard.controller');
const { protect, isAdmin, isSeller } = require('../middlewares/auth.middleware');

router.get('/admin-stats', protect, isAdmin, getAdminDashboardStats);

router.get('/seller-stats', protect, isSeller, getSellerDashboardStats);

module.exports = router;