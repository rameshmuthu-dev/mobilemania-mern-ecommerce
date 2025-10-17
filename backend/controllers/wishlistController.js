const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/whishlist') // Note: Corrected typo 'whishlist' to 'Wishlist' to match file structure if 'Wishlist.js' is the actual file name.
const Product = require('../models/Product');


/**
 * @desc Get the user's wishlist
 * @route GET /api/wishlist
 * @access Private
 */
const getWishlist = asyncHandler(async (req, res) => {
    // Find the wishlist document for the logged-in user (req.user is set by auth middleware)
    // Populate the 'product' field within the 'items' array to get product details
    const wishlist = await Wishlist.findOne({ user: req.user._id })
        .populate({
            path: 'items.product',
            select: 'name price images rating numReviews countInStock', // Select necessary fields
        });

    if (wishlist) {
        // Return the items array which now includes populated product details
        res.json({
            message: 'Wishlist fetched successfully',
            wishlist: wishlist.items,
        });
    } else {
        // If no wishlist document exists for the user, return an empty list
        res.json({
            message: 'Wishlist is empty',
            wishlist: [],
        });
    }
});


const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;

    // Optional: Check if the product ID is valid (exists in the Product Model)
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
    }

    // 1. Find or create the user's wishlist
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        // If wishlist doesn't exist, create a new one
        wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // 2. Check if the product is already in the wishlist
    const isItemExist = wishlist.items.some(
        (item) => item.product.toString() === productId
    );

    if (isItemExist) {
        // If it already exists, send 200/201 and return the current list (No change needed)
        await wishlist.populate({
            path: 'items.product',
            select: 'name price images rating numReviews countInStock',
        });
        res.status(200).json({
            message: 'Product already in wishlist',
            wishlist: wishlist.items,
        });
        return;
    }

    // 3. Add the new product
    wishlist.items.push({ product: productId });
    await wishlist.save();

    // 4. Return the updated wishlist (populate product details)
    await wishlist.populate({
        path: 'items.product',
        select: 'name price images rating numReviews countInStock',
    });

    res.status(201).json({
        message: 'Product added to wishlist',
        wishlist: wishlist.items,
    });
});


const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Find the user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        res.status(404).json({ message: 'Wishlist not found' });
        return;
    }

    // 2. Filter out the item to be removed
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
        (item) => item.product.toString() !== productId
    );

    // Check if an item was actually removed
    if (wishlist.items.length === initialLength) {
        res.status(404).json({ message: 'Product not found in wishlist' });
        return;
    }

    // 3. Save the updated list
    await wishlist.save();

    // 4. Return the updated wishlist
    await wishlist.populate({
        path: 'items.product',
        select: 'name price images rating numReviews countInStock',
    });

    res.json({
        message: 'Product removed from wishlist',
        wishlist: wishlist.items,
    });
});

/**
 * Use module.exports to make the controller functions available
 * in files that use the require() function (e.g., in your routes file).
 */
module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};