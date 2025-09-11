const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Page title is required.'],
        trim: true,
        unique: true,
    },
    slug: {
        type: String,
        required: [true, 'Page slug is required.'],
        trim: true,
        unique: true,
        lowercase: true,
        // স্লাগে কোনো স্পেস থাকবে না
        validate: {
            validator: function(v) {
                return /^[a-z0-9-]+$/.test(v);
            },
            message: props => `${props.value} is not a valid slug! Use only lowercase letters, numbers, and hyphens.`
        }
    },
    content: {
        type: String,
        required: [true, 'Content is required.'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    metaTitle: {
        type: String,
        trim: true,
    },
    metaDescription: {
        type: String,
        trim: true,
    }
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);
module.exports = Page;