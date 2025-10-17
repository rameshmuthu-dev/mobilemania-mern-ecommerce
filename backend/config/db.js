const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

const connectDB = asyncHandler(async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connection established`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
});

module.exports = connectDB;