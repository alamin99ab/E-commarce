const Category = require('../models/category.model');

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
    try {
        const { name, description, image } = req.body;
        const category = await Category.create({ name, description, image });
        res.status(201).json(category);
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: `Category '${error.keyValue.name}' already exists.` });
        }
        next(error);
    }
};

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single category by ID
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'Category not found.' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update a category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'Category not found.' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            await Category.deleteOne({ _id: req.params.id });
            res.status(200).json({ message: 'Category deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Category not found.' });
        }
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};