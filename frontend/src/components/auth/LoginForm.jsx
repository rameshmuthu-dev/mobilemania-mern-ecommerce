

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import Button from '../ui/Button'; // Assuming ui/Button is available
import Input from '../ui/Input';   // Assuming ui/Input is available
import { login } from '../../slices/authSlice'; // Import the login thunk

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center">
            <FaSignInAlt className="mr-3 text-indigo-600" /> Sign In
        </h1>
        
        <form onSubmit={submitHandler} className="space-y-6">
            
            {/* Email Input */}
            <Input 
                label="Email Address"
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                Icon={FaEnvelope}
                placeholder="Enter your email" 
                required 
            />
            
            {/* Password Input */}
            <Input 
                label="Password"
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                Icon={FaLock}
                placeholder="Enter password" 
                required 
            />

            {/* Login Button (Uses Gradient Variant) */}
            <Button 
                type="submit" 
                variant="gradient"
                isLoading={isLoading} 
                className="w-full mt-6"
            >
                Log In
            </Button>
        </form>
    </div>
  );
};

export default LoginForm;