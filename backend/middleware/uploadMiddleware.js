const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mobile-mania-products',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => `${Date.now()}-${file.originalname}`,
    },
});

const upload = multer({ storage: storage });

module.exports = upload;