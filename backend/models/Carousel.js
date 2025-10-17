const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    
   
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true 
    }
    
}, { timestamps: true });

module.exports = mongoose.model('Carousel', carouselSchema);