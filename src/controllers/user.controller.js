const User = require('../models/user.model');

// --- নতুন ফাংশন: বিক্রেতা হওয়ার জন্য আবেদন ---
const applyToBeSeller = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { businessName } = req.body;

        if (!businessName) {
            return res.status(400).json({ message: "Business name is required." });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        user.role = 'seller';
        user.businessName = businessName;
        user.approvalStatus = 'pending';
        await user.save();

        res.status(200).json({
            success: true,
            message: "Application submitted successfully! Please wait for admin approval.",
        });
    } catch (error) {
        next(error);
    }
};

// --- নতুন ফাংশন: অপেক্ষমাণ বিক্রেতাদের তালিকা ---
const getPendingSellers = async (req, res, next) => {
    try {
        const pendingSellers = await User.find({ approvalStatus: 'pending', role: 'seller' }).select('-password');
        res.status(200).json(pendingSellers);
    } catch (error) {
        next(error);
    }
};

// --- নতুন ফাংশন: বিক্রেতার আবেদন অনুমোদন ---
const approveSeller = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (user && user.role === 'seller') {
            user.approvalStatus = 'approved';
            await user.save();
            res.status(200).json({ message: 'Seller approved successfully.' });
        } else {
            res.status(404).json({ message: 'Seller not found.' });
        }
    } catch (error) {
        next(error);
    }
};

// --- আপনার আগের সঠিক ফাংশনগুলো ---
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) res.status(200).json(user);
        else res.status(404).json({ message: 'User not found.' });
    } catch (error) {
        next(error);
    }
};

const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.status(200).json({
                _id: updatedUser._id, name: updatedUser.name,
                email: updatedUser.email, role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.role = req.body.role || user.role;
            user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
            user.approvalStatus = req.body.approvalStatus || user.approvalStatus;
            const updatedUser = await user.save();
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: user._id });
            res.status(200).json({ message: 'User removed successfully.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        next(error);
    }
};

// **সব ফাংশন একসাথে এক্সপোর্ট করা হচ্ছে**
module.exports = {
    getAllUsers,
    getUserById,
    updateUserProfile,
    updateUser,
    deleteUser,
    applyToBeSeller,
    getPendingSellers,
    approveSeller,
};