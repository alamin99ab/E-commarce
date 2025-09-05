// src/routes/application.routes.js
const express = require('express');
const router = express.Router();
const { applyForSeller, getAllApplications, updateApplicationStatus } = require('../controllers/application.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware'); // আপনার অথেনটিকেশন মিডলওয়্যার

// POST /api/v1/applications/apply - ব্যবহারকারী আবেদন করবে
router.post('/apply', protect, applyForSeller);

// GET /api/v1/applications - অ্যাডমিন সকল আবেদন দেখবে
router.get('/', protect, isAdmin, getAllApplications);

// PUT /api/v1/applications/:id - অ্যাডমিন আবেদন approve/reject করবে
router.put('/:id', protect, isAdmin, updateApplicationStatus);

module.exports = router;