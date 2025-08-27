// File: models/page.model.js
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    slug: { // যেমন: 'about-us', 'contact-us'
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: { // এখানে পেইজের বিস্তারিত লেখা (HTML ফরম্যাটে) থাকবে
        type: String,
        required: true,
    },
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);
module.exports = Page;