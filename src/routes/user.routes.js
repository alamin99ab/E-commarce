const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUserProfile,
    updateUser,
    deleteUser,
} = require('../controllers/user.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

router.route('/profile')
    .put(protect, updateUserProfile);

router.route('/')
    .get(protect, isAdmin, getAllUsers);

router.route('/:id')
    .get(protect, isAdmin, getUserById)
    .put(protect, isAdmin, updateUser)
    .delete(protect, isAdmin, deleteUser);

module.exports = router;