const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Multer error handling
    if (err instanceof multer.MulterError) {
        console.error("Multer error:", err.message);
        return res.status(400).json({
            message: `Multer Error: ${err.message}`,
            field: err.field || null
        });
    }
    
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

const notFound = (req, res, next) => {
    res.status(404);
    throw new Error(`Not Found - ${req.originalUrl}`);
};

module.exports = { errorHandler, notFound };