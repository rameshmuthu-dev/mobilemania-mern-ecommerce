const express = require('express')
const router = express.Router();

const { protect } = require ('../middleware/authMiddleware.js') 
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} = require ( '../controllers/wishlistController.js');



// All wishlist routes are protected, meaning the user must be logged in.

// 1. Route for fetching the wishlist (GET) and adding a product (POST)
// Route: /api/wishlist
router.route('/')
    // GET: Fetch the entire wishlist for the logged-in user
    .get(protect, getWishlist) 
    // POST: Add a new product to the wishlist (Expects { productId } in req.body)
    .post(protect, addToWishlist); 

// 2. Route for removing a product
// Route: /api/wishlist/:productId
router.route('/:productId')
    // DELETE: Remove a product using its ID from the URL parameter
    .delete(protect, removeFromWishlist);

module.exports= router;