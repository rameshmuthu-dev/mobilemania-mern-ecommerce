import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../ui/Message'
import Spinner from '../ui/Spinner'
import Button from '../ui/Button'

// Import register and reset actions from your confirmed authSlice
import { register, reset } from '../../redux/slices/authSlice'

const RegisterPage = () => { 
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localMessage, setLocalMessage] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Use 'user' to match your authSlice state structure.
    const { user, isLoading, isError, message } = useSelector((state) => state.auth); 

    
    const redirect = location.search ? location.search.split('=')[1] : '/'; 

    useEffect(() => {
        // If user is already logged in, redirect them immediately
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
        setLocalMessage(null); 

        if (password !== confirmPassword) {
            setLocalMessage('Passwords do not match');
        } else {
            // Dispatch the register thunk
            dispatch(register({ name, email, password }));
        }
    };

    return (
        <div className="flex justify-center items-center py-10 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <h1 className="text-3xl font-bold text-center text-gray-800">Sign Up</h1>
                
                {/* Error/Message Display */}
                {localMessage && <Message variant="danger">{localMessage}</Message>}
                {isError && <Message variant="danger">{message}</Message>}
                {isLoading && <Spinner />}

                <form onSubmit={submitHandler} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            placeholder="Enter full name"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                            required
                        />
                    </div>
                    {/* Confirm Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm password"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button 
                        type="submit" 
                        variant="success" 
                        className="w-full text-lg" 
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner /> : 'Register'}
                    </Button>
                </form>

                <div className="text-center pt-4 border-t mt-4">
                    <p className="text-sm text-gray-600">
                        Have an account?{' '}
                        <Link 
                            to={redirect ? `/login?redirect=${redirect}` : '/login'} 
                            className="text-lime-600 hover:text-lime-800 font-medium"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;