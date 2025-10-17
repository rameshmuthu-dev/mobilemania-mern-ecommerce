import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// Ensure these paths are correct relative to src/pages/ForgotPasswordPage.jsx
import Message from '../ui/Message'; 
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';

// Thunks imported from your authSlice (as previously defined)
import { requestPasswordReset, resetPassword, reset } from '../../redux/slices/authSlice'; 

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Request Email, 2: Reset Password
    const [localMessage, setLocalMessage] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading, isError, message } = useSelector((state) => state.auth);

    // Clean up Redux state errors on mount
    useEffect(() => {
        dispatch(reset());
        return () => { dispatch(reset()); };
    }, [dispatch]);

    // --- STEP 1 HANDLER: Request OTP ---
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLocalMessage(null);

        // Dispatch the thunk to request OTP
        const resultAction = await dispatch(requestPasswordReset(email));

        // Check if the request was successful
        if (requestPasswordReset.fulfilled.match(resultAction)) {
            // If API call is successful, move to step 2
            setStep(2);
        }
        // Error message is handled by Redux state and toast
    };

    // --- STEP 2 HANDLER: Reset Password ---
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLocalMessage(null);

        if (newPassword.length < 6) {
            setLocalMessage('Password must be at least 6 characters long.');
            return;
        }

        // Dispatch the thunk to reset the password
        const data = { email, otp, newPassword };
        const resultAction = await dispatch(resetPassword(data));

        // Check if the password reset was successful
        if (resetPassword.fulfilled.match(resultAction)) {
            // If successful, navigate the user back to the login page
            navigate('/login');
        }
        // Error message is handled by Redux state and toast
    };


    return (
        <div className="flex justify-center items-center py-10 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    {step === 1 ? 'Forgot Password (Step 1)' : 'Reset Password (Step 2)'}
                </h1>
                
                {/* Error/Message Display */}
                {localMessage && <Message variant="danger">{localMessage}</Message>}
                {isError && <Message variant="danger">{message}</Message>}
                {isLoading && <Spinner />}

                {/* ========================================================= */}
                {/* --- STEP 1: Request OTP by Email --- */}
                {/* ========================================================= */}
                {step === 1 && (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                        <p className="text-gray-600 text-sm">
                            Enter your email address to receive a One-Time Password (OTP) for password reset.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter registered email"
                                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <Button 
                            type="submit" 
                            variant="success" 
                            className="w-full text-lg" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                    </form>
                )}

                {/* ========================================================= */}
                {/* --- STEP 2: Enter OTP and New Password --- */}
                {/* ========================================================= */}
                {step === 2 && (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <p className="text-sm text-green-600 font-semibold">
                            An OTP has been sent to the email: <span className='font-bold'>{email}</span>.
                        </p>

                        {/* OTP Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">OTP</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Restrict to numbers
                                required
                                minLength={6}
                                maxLength={6}
                            />
                        </div>
                        
                        {/* New Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password (min 6 chars)"
                                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button 
                            type="submit" 
                            variant="success" 
                            className="w-full text-lg" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                        <div className="text-center">
                             <Button type="button" variant="link" onClick={() => setStep(1)} className="text-sm text-lime-600 hover:text-lime-800">
                                Back to Step 1 (Change Email)
                            </Button>
                        </div>
                    </form>
                )}

                <div className="text-center pt-4 border-t mt-4">
                    <p className="text-sm text-gray-600">
                        Remembered your password?{' '}
                        <Link 
                            to="/login" 
                            className="text-lime-600 hover:text-lime-800 font-medium"
                        >
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;