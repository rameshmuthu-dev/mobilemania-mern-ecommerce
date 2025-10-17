const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');



const userSchema = new mongoose.Schema({

    firstName: { type: String, required: true },

    lastName: { type: String },

    email: { type: String, required: true, unique: true },

    password: { type: String },

    isVerified: { type: Boolean, required: true, default: false },

    isAdmin: { type: Boolean, required: true, default: false },

    cart: [{

        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

        qty: { type: Number, required: true }

    }],

    wishlist: [{

        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }

    }],

    otp: String,

    otpExpiry: Date,

    otpLastSentAt: Date

});



userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) {

        return next();

    }

    try {

        const salt = await bcrypt.genSalt(10);

        this.password = await bcrypt.hash(this.password, salt);

        next();

    } catch (error) {

        next(error); 

    }

});



userSchema.methods.matchPassword = async function (enteredPassword) {

    try {

        return await bcrypt.compare(enteredPassword, this.password);

    } catch (error) {

        // You can log the error or handle it as needed

        console.error('Error during password comparison:', error);

        return false; // 

    }

};



module.exports = mongoose.model('User', userSchema);