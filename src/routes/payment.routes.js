const express = require('express');
const router = express.Router();
const { 
    initPayment, 
    paymentSuccess, 
    paymentFail, 
    paymentCancel 
} = require('../controllers/payment.controller');

// এখানে আপনার auth.middleware.js ফাইল অনুযায়ী 'protect' ব্যবহার করা হয়েছে
const { protect } = require('../middlewares/auth.middleware'); 

router.post('/init', protect, initPayment); // 'protect' ব্যবহার করা হয়েছে
router.post('/success', paymentSuccess);
router.post('/fail', paymentFail);
router.post('/cancel', paymentCancel);

module.exports = router;