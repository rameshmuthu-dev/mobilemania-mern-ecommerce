import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button'; 

const UserForm = ({ initialData, onSubmit, isEdit, isLoading = false }) => {
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        isAdmin: false,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                isAdmin: initialData.isAdmin || false,
                password: '',
                confirmPassword: '',
            });
        }
    }, [initialData]);

    const { 
        firstName, 
        lastName, 
        email, 
        password, 
        confirmPassword, 
        isAdmin 
    } = formData;

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const submitHandler = (e) => {
        e.preventDefault();
        
        if (!isEdit && password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={submitHandler} className="space-y-4">
            <div>
                <label htmlFor='firstName' className='block text-sm font-medium text-gray-700 mb-1'>
                    First Name
                </label>
                <input
                    type='text'
                    id='firstName'
                    placeholder='Enter first name'
                    name='firstName'
                    value={firstName}
                    onChange={onChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500'
                />
            </div>

            <div>
                <label htmlFor='lastName' className='block text-sm font-medium text-gray-700 mb-1'>
                    Last Name
                </label>
                <input
                    type='text'
                    id='lastName'
                    placeholder='Enter last name'
                    name='lastName'
                    value={lastName}
                    onChange={onChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500'
                />
            </div>

            <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                    Email Address
                </label>
                <input
                    type='email'
                    id='email'
                    placeholder='Enter email'
                    name='email'
                    autoComplete='email'
                    value={email}
                    onChange={onChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500'
                />
            </div>

            {!isEdit && (
                <div>
                    <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
                        Password
                    </label>
                    <input
                        type='password'
                        id='password'
                        placeholder='Enter password'
                        name='password'
                        value={password}
                        autoComplete="new-password"
                        onChange={onChange}
                        required={!isEdit}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500'
                    />
                </div>
            )}

            {!isEdit && (
                <div>
                    <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-1'>
                        Confirm Password
                    </label>
                    <input
                        type='password'
                        id='confirmPassword'
                        placeholder='Confirm password'
                        name='confirmPassword'
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={onChange}
                        required={!isEdit}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500'
                    />
                </div>
            )}

            {isEdit && (
                <div className="flex items-center pt-2">
                    <input
                        type='checkbox'
                        id='isAdmin'
                        name='isAdmin'
                        checked={isAdmin}
                        onChange={onChange}
                        className='h-4 w-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500'
                    />
                    <label htmlFor='isAdmin' className='ml-2 block text-sm text-gray-900 select-none'>
                        Is Admin
                    </label>
                </div>
            )}

            <Button 
                type='submit' 
                variant='primary'
                isLoading={isLoading}
                className="w-full mt-6"
            >
                {isEdit ? 'Update User' : 'Create User'}
            </Button>
        </form>
    );
};

export default UserForm;