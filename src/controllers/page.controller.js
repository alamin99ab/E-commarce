const Page = require('../models/page.model');

// @desc    Create a new page
// @route   POST /api/v1/pages
// @access  Private/Admin
exports.createPage = async (req, res, next) => {
    try {
        const { title, slug, content, metaTitle, metaDescription } = req.body;
        const page = await Page.create({ title, slug, content, metaTitle, metaDescription });
        res.status(201).json({ success: true, data: page });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all active pages (for public view)
// @route   GET /api/v1/pages
// @access  Public
exports.getAllActivePages = async (req, res, next) => {
    try {
        const pages = await Page.find({ isActive: true }).select('title slug');
        res.status(200).json({ success: true, data: pages });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single page by its slug (for public view)
// @route   GET /api/v1/pages/:slug
// @access  Public
exports.getPageBySlug = async (req, res, next) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug, isActive: true });
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found.' });
        }
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a page by ID
// @route   PUT /api/v1/pages/:id
// @access  Private/Admin
exports.updatePage = async (req, res, next) => {
    try {
        const page = await Page.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found.' });
        }
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a page by ID
// @route   DELETE /api/v1/pages/:id
// @access  Private/Admin
exports.deletePage = async (req, res, next) => {
    try {
        const page = await Page.findByIdAndDelete(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found.' });
        }
        res.status(200).json({ success: true, message: 'Page deleted successfully.' });
    } catch (error) {
        next(error);
    }
};