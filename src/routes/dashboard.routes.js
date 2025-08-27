const express = require('express');
const router = express.Router();
const {
    getAdminDashboardStats
} = require('../controllers/dashboard.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// ড্যাশবোর্ডের পরিসংখ্যান পাওয়ার জন্য এই রাউটটি শুধুমাত্র অ্যাডমিনদের জন্য
router.get('/', protect, isAdmin, getAdminDashboardStats);

module.exports = router;