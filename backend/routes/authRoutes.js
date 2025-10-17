const express = require('express');
const router = express.Router();
const {
    requestOtp,
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/request-otp', requestOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile); 
module.exports = router;