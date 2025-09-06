const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cloudinary কনফিগার করা
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

exports.uploadImage = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        try {
            let result = await streamUpload(req);
            res.status(201).json({ success: true, message: "Image uploaded successfully", url: result.secure_url });
        } catch (err) {
            next(err);
        }
    }

    upload(req);
};