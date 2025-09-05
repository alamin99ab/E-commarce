const express = require('express');
const router = express.Router();
const { 
    initPayment, 
    paymentSuccess, 
    paymentFail, 
    paymentCancel,
    paymentIpn
} = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware'); 

// POST /api/v1/payment/init
router.post('/init', protect, initPayment);

// SSLCOMMERZ থেকে কলব্যাক রাউটগুলো (এগুলো POST হবে)
router.post('/success', paymentSuccess);
router.post('/fail', paymentFail);
router.post('/cancel', paymentCancel);
router.post('/ipn', paymentIpn);

module.exports = router;