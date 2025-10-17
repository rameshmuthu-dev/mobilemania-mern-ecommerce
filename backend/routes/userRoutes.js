const express = require('express');
const router = express.Router();
const {
    updateCart,
    getCart,
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    registerUserByAdmin
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/cart')
    .post(protect, updateCart)
    .get(protect, getCart);

router.route('/wishlist')
    .post(protect, addToWishlist)
    .get(protect, getWishlist);

router.delete('/wishlist/:id', protect, removeFromWishlist);


// --- Admin User Management Routes

router.route('/')
.get(protect, admin, getUsers)
.post(protect, admin, registerUserByAdmin)

router.route('/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

module.exports = router;