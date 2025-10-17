const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Add to cart / Update cart
// @route   POST /api/users/cart
// @access  Private
const updateCart = asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;
    const user = await User.findById(req.user._id);
    
    if (user) {
        const itemExists = user.cart.find(item => item.product.toString() === productId);
        if (itemExists) {
            itemExists.qty = qty;
        } else {
            user.cart.push({ product: productId, qty });
        }
        await user.save();
        res.status(201).json(user.cart);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('cart.product', 'name price images');
    
    if (user) {
        res.json(user.cart);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
            res.status(201).json(user.wishlist);
        } else {
            res.status(400);
            throw new Error('Product already in wishlist');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist.product');
    
    if (user) {
        res.json(user.wishlist);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const user = await User.findById(req.user._id);

    if (user) {
        user.wishlist = user.wishlist.filter(item => item.toString() !== productId);
        await user.save();
        res.json({ message: 'Product removed from wishlist' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password -otp -otpExpiry -otpLastSentAt'); 
    res.json(users);
})

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    // ✅ .lean() -ஐச் சேர்க்கவும்
    const user = await User.findById(req.params.id)
        .select('-password -otp -otpExpiry -otpLastSentAt')
        .lean(); 
        
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('Cannot delete yourself as an Admin');
        }

        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user to admin
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.firstName = req.body.firstName || user.firstName; 
        user.lastName = req.body.lastName || user.lastName; 
        user.email = req.body.email || user.email;
        
        user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin; 

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName, 
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
const registerUserByAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, isAdmin } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        isAdmin: isAdmin !== undefined ? isAdmin : false,
        isVerified: true,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data received');
    }
});


module.exports = {
    updateCart,
    getCart,
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    getUsers,getUserById,deleteUser,updateUser,registerUserByAdmin,

};