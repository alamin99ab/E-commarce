const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUserProfile,
    updateUser,
    deleteUser,
    applyToBeSeller,
    getPendingSellers,
    approveSeller
} = require('../controllers/user.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// --- বিক্রেতা হওয়ার আবেদনের জন্য নতুন রুট ---
router.post('/apply-seller', protect, applyToBeSeller);

// --- অ্যাডমিনের জন্য রুট ---
router.get('/sellers/pending', protect, isAdmin, getPendingSellers);
router.put('/sellers/approve/:id', protect, isAdmin, approveSeller);

// --- আপনার আগের সঠিক রুটগুলো ---
router.route('/profile')
    .put(protect, updateUserProfile);

router.route('/')
    .get(protect, isAdmin, getAllUsers);

router.route('/:id')
    .get(protect, isAdmin, getUserById)
    .put(protect, isAdmin, updateUser)
    .delete(protect, isAdmin, deleteUser);

module.exports = router;