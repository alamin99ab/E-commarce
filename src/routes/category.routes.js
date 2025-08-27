const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// Unprotected routes for getting categories
router.route('/')
    .get(getAllCategories);

router.route('/:id')
    .get(getCategoryById);

// Protected Admin routes for creating, updating, and deleting categories
router.route('/')
    .post(protect, isAdmin, createCategory);

router.route('/:id')
    .put(protect, isAdmin, updateCategory)
    .delete(protect, isAdmin, deleteCategory);


module.exports = router;