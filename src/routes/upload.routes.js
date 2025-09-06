const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/upload.controller');
const upload = require('../middlewares/multer.middleware');
const { protect } = require('../middlewares/auth.middleware');

// POST /api/v1/upload
router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;