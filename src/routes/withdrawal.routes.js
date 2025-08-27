// File: backend/src/routes/withdrawal.routes.js

const express = require('express');
const router = express.Router();
const {
    createWithdrawalRequest,
    getAllWithdrawalRequests,
    updateWithdrawalStatus,
} = require('../controllers/withdrawal.controller');
// middlewares/auth.middleware ফাইল থেকে protect, isSeller, isAdmin ইম্পোর্ট করুন
const { protect, isSeller, isAdmin } = require('../middlewares/auth.middleware');

router.post('/create-request', protect, isSeller, createWithdrawalRequest);

router.get('/all-requests', protect, isAdmin, getAllWithdrawalRequests);
router.put('/update-status/:id', protect, isAdmin, updateWithdrawalStatus);

module.exports = router;