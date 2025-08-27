// File: controllers/page.controller.js
const Page = require('../models/page.model');

// --- একটি পেইজের তথ্য তার slug দিয়ে পাওয়া ---
const getPageBySlug = async (req, res, next) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug });
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        res.status(200).json({ success: true, page });
    } catch (error) {
        next(error);
    }
};

// --- একটি পেইজ তৈরি বা আপডেট করা (অ্যাডমিন) ---
const createOrUpdatePage = async (req, res, next) => {
    try {
        const { slug, title, content } = req.body;
        
        const page = await Page.findOneAndUpdate(
            { slug },
            { title, content },
            { new: true, upsert: true, runValidators: true } // upsert: true মানে হলো, যদি পেইজ না থাকে তাহলে নতুন তৈরি করবে
        );
        
        res.status(200).json({ success: true, message: 'Page content updated successfully', page });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPageBySlug,
    createOrUpdatePage,
};