// src/components/auth/RegisterForm.jsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import Button from '../ui/Button'
import Input from '../ui/Input';   
import { register } from '../../slices/authSlice';
import { toast } from 'react-toastify';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    
    const { firstName, lastName, email, password, confirmPassword } = formData;
    
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    };

    const submitHandler = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        const userData = { firstName, lastName, email, password };
        dispatch(register(userData));
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center">
                <FaUserPlus className="mr-3 text-indigo-600" /> Create Account
            </h1>
            <form onSubmit={submitHandler} className="space-y-4">
                
                {/* Name Inputs */}
                <div className="flex space-x-4">
                    <Input 
                        label="First Name"
                        type="text" 
                        id="firstName" 
                        value={firstName} 
                        onChange={onChange}
                        Icon={FaUser}
                        placeholder="First Name" 
                        required 
                        className="flex-1"
                    />
                    <Input 
                        label="Last Name (Optional)"
                        type="text" 
                        id="lastName" 
                        value={lastName} 
                        onChange={onChange}
                        placeholder="Last Name" 
                        className="flex-1 pl-4" // No icon for simple placeholder
                    />
                </div>
                
                {/* Email Input */}
                <Input 
                    label="Email Address"
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={onChange}
                    Icon={FaEnvelope}
                    placeholder="Enter email" 
                    required 
                />
                
                {/* Password Input */}
                <Input 
                    label="Password"
                    type="password" 
                    id="password" 
                    value={password} 
                    onChange={onChange}
                    Icon={FaLock}
                    placeholder="Enter password" 
                    required 
                />
                
                {/* Confirm Password Input */}
                <Input 
                    label="Confirm Password"
                    type="password" 
                    id="confirmPassword" 
                    value={confirmPassword} 
                    onChange={onChange}
                    Icon={FaLock}
                    placeholder="Confirm password" 
                    required 
                />

                {/* Register Button (Uses Gradient Variant) */}
                <Button 
                    type="submit" 
                    variant="gradient"
                    isLoading={isLoading} 
                    className="w-full mt-6"
                >
                    Register
                </Button>
            </form>
        </div>
    );
};

export default RegisterForm;