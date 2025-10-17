const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    
    orderItems: [{
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    }],
    
    shippingAddress: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    
    itemsPrice: { type: Number, required: true, default: 0.00 },
    shippingPrice: { type: Number, required: true, default: 0.00 },
    taxPrice: { type: Number, required: true, default: 0.00 },
    
    totalPrice: { type: Number, required: true, default: 0.00 },
    
    paymentMethod: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);