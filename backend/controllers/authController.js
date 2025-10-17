const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

// @desc    Request OTP for registration
// @route   POST /api/users/request-otp
// @access  Public
const requestOtp = asyncHandler(async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const userExists = await User.findOne({ email });
    
    if (userExists && userExists.isVerified) {
        res.status(400);
        throw new Error('User already exists with this email address');
    }
    
    if (userExists && userExists.otpLastSentAt) {
        const timeElapsed = (Date.now() - userExists.otpLastSentAt) / 1000;
        if (timeElapsed < 30) {
            res.status(429);
            throw new Error('Please wait 30 seconds before requesting a new OTP.');
        }
    }
    
    let user;
    if (userExists) {
        user = userExists;
    } else {
        user = await User.create({ firstName, lastName, email });
    }
    
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = Date.now() + 300000;
    user.otpLastSentAt = Date.now();
    await user.save();
    
    const subject = 'Mobile Mania - Verify Your Email Address';
    const text = `Hi ${user.firstName},\n\nYour OTP for email verification is: ${otp}\n\nThis OTP is valid for 1 minute.`;
    await sendEmail(user.email, subject, text);
    
    res.status(200).json({ success: true, message: 'OTP sent to your email' });
});

// @desc    Register user with OTP verification
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, otp, firstName, lastName } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        res.status(404);
        throw new Error('User not found. Please request an OTP first.');
    }
    
    if (user.isVerified) {
        res.status(400);
        throw new Error('Email is already verified. Please login.');
    }
    
    if (user.otpExpiry < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired. Please request a new OTP.');
    }
    
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
        res.status(400);
        throw new Error('Invalid OTP');
    }
    
    user.password = password;
    user.isVerified = true;
    user.firstName = firstName;
    user.lastName = lastName;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    const subject = 'Welcome to Mobile Mania!';
    const text = `Hi ${user.firstName},\n\nThanks for registering with us. We are excited to have you on board!`;
    await sendEmail(user.email, subject, text);
    
    res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
    });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            res.status(401);
            throw new Error('Account not verified. Please verify your email with the OTP.');
        }
        
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            token: jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    res.json({
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        isVerified: req.user.isVerified
    });
});

// @desc    Forgot password - Send OTP
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        res.status(404);
        throw new Error('User not found with that email address');
    }
    
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = Date.now() + 600000;
    await user.save();
    
    const message = `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.`;
    const forgotPasswordSubject = 'Mobile Mania - Password Reset OTP';
    await sendEmail(user.email, forgotPasswordSubject, message);
    
    res.status(200).json({ success: true, message: 'Password reset OTP sent to your email' });
});

// @desc    Reset password with OTP
// @route   POST /api/users/resetpassword
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    if (user.otpExpiry < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired');
    }
    
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
        res.status(400);
        throw new Error('Invalid OTP');
    }
    
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
});
const updateUserProfile = asyncHandler(async (req, res) => {
    // req.user is available because of the 'protect' middleware
    const user = await User.findById(req.user._id);

    if (user) {
        // Update firstName, lastName, and email
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;

        // Update password only if a new one is provided in the request body
        if (req.body.password) {
            // Your userSchema.pre('save') hook will handle hashing the new password
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        // Send back the new user data (excluding the password and token)
        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isVerified: updatedUser.isVerified,
            // NOTE: The token should be managed on the frontend, or you could regenerate it here.
            // For now, we rely on the frontend (ProfilePage.jsx) to retain the old token.
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    requestOtp,
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword
};