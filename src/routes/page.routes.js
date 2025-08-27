// File: routes/page.routes.js
const express = require('express');
const router = express.Router();
const { getPageBySlug, createOrUpdatePage } = require('../controllers/page.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// --- সাধারণ ব্যবহারকারীদের জন্য রুট ---
router.get('/:slug', getPageBySlug);

// --- অ্যাডমিনের জন্য রুট ---
router.post('/update', protect, isAdmin, createOrUpdatePage);

module.exports = router;