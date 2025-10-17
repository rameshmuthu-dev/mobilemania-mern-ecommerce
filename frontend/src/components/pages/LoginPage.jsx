import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// Corrected imports based on your provided path:
import Message from '../ui/Message' 
import Spinner from '../ui/Spinner'
import Button from '../ui/Button'


import { login, reset } from '../../redux/slices/authSlice'

const LoginPage = () => { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Use 'user' to match your authSlice state structure.
    const { user, isLoading, isError, message } = useSelector((state) => state.auth);

    // Get the redirect path from the URL query or default to home
    const redirect = location.search ? location.search.split('=')[1] : '/'; 

    useEffect(() => {
        // If user is already logged in, redirect them immediately to the intended page
        if (user) {
            navigate(redirect);
        }
        
        // Clean up Redux state error/message on component mount
        dispatch(reset()); 

        // Cleanup on unmount
        return () => {
            dispatch(reset());
        };
    }, [navigate, user, redirect, dispatch]);

    const submitHandler = (e) => {
        e.preventDefault();
        
        // Dispatch the login thunk
        dispatch(login({ email, password }));
    };

    return (
        <div className="flex justify-center items-center py-10 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <h1 className="text-3xl font-bold text-center text-gray-800">Sign In</h1>
                
                {/* Error/Message Display */}
                {isError && <Message variant="danger">{message}</Message>}
                {isLoading && <Spinner />}

                <form onSubmit={submitHandler} className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete='yes'
                            required
                        />
                    </div>
                    
                    {/* 🔑 FORGOT PASSWORD LINK */}
                    <div className="text-right">
                        <Link 
                            to="/forgot-password" 
                            className="text-sm text-lime-600 hover:text-lime-800 font-medium"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <Button 
                        type="submit" 
                        variant="gradient" 
                        className="w-full text-lg" 
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner /> : 'Sign In'}
                    </Button>
                </form>

                <div className="text-center pt-4 border-t mt-4">
                    <p className="text-sm text-gray-600">
                        New Customer?{' '}
                        <Link 
                            // Ensures the redirect parameter is passed to the register page too
                            to={redirect ? `/register?redirect=${redirect}` : '/register'} 
                            className="text-lime-600 hover:text-lime-800 font-medium"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;