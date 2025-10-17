const cloudinary = require('cloudinary').v2;

// Cloudinary configuration (already done in uploadMiddleware)
// This file can be used for additional Cloudinary utility functions

const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Error deleting image: ${error.message}`);
    }
};

module.exports = { deleteImage };