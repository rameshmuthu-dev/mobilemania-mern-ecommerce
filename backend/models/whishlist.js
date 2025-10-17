const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema(
    {
        // 1. User: The owner of this wishlist. 
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Links to the User Model
            unique: true, // Ensures one wishlist document per user
        },
        // 2. Items: An array of products in the wishlist.
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product', // Links to the Product Model
                },
                // You can add 'addedAt' timestamp here if you want to track when an item was added.
            },
        ],
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create the model using the schema
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// CORRECT EXPORT
module.exports = Wishlist;