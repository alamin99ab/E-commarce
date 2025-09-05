const express = require('express');
const router = express.Router();
const { applyForSeller, getAllApplications, updateApplicationStatus } = require('../controllers/application.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

router.post('/apply', protect, applyForSeller);
router.get('/', protect, isAdmin, getAllApplications);
router.put('/:id', protect, isAdmin, updateApplicationStatus);

module.exports = router;