const express = require('express');
const router = express.Router();
const {
    createPage,
    getAllActivePages,
    getPageBySlug,
    updatePage,
    deletePage
} = require('../controllers/page.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', getAllActivePages);
router.get('/:slug', getPageBySlug);

// Admin routes
router.post('/', protect, isAdmin, createPage);
router.put('/:id', protect, isAdmin, updatePage);
router.delete('/:id', protect, isAdmin, deletePage);

module.exports = router;