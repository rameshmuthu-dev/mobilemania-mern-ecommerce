const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    countInStock: { type: Number, required: true, default: 0 },
    specs: {
        processor: { type: String },
        ram: { type: String },
        storage: { type: String },
        display: { type: String },
        camera: { type: String },
        battery: { type: String },
        graphicsCard: { type: String },
        os: { type: String },
        color: { type: String },
    },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);