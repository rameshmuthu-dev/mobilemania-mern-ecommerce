import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
    registerUserByAdmin, 
    reset 
} from '../../../redux/slices/authSlice'; 

import UserForm from '../ui/UserForm'; 
import Button from '../../ui/Button'; 

const UserCreatePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { 
        user, 
        isLoading, 
        isError, 
        message 
    } = useSelector((state) => state.auth);

    const [createSuccess, setCreateSuccess] = useState(false);
    
    const TailwindSpinner = () => (
        <div className="flex justify-center items-center py-6">
            <svg className="animate-spin h-6 w-6 text-lime-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
    
    const TailwindAlert = ({ children, variant }) => (
        <div className={`p-4 mb-4 rounded-lg text-sm 
            ${variant === 'danger' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
            role="alert">
            {children}
        </div>
    );

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }

        if (isError) {
            toast.error(message);
            dispatch(reset());
        }

        if (createSuccess) {
            navigate('/admin/users');
            dispatch(reset());
        }

        return () => {
            dispatch(reset()); 
        };
    }, [dispatch, navigate, user, isError, message, createSuccess]);


    const submitCreateHandler = (formData) => {
        const userData = { ...formData, password: formData.password || "temp_password_123" }; 
        
        dispatch(registerUserByAdmin(userData))
        .unwrap() 
        .then(() => {
            setCreateSuccess(true);
            toast.success('New user created successfully!');
        })
        .catch(() => {
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Link to='/admin/users'>
                <Button 
                    variant="secondary" 
                    className='mb-4 flex items-center !py-2 !px-4'
                >
                    <FaArrowLeft className='mr-2' /> Go Back to Users
                </Button>
            </Link>

            <div className="max-w-md mx-auto bg-white p-8 shadow-xl rounded-lg">
                <h1 className='text-3xl font-bold mb-6 text-gray-800 text-center'>Create New User</h1>
                
                {isError && <TailwindAlert variant="danger">{message}</TailwindAlert>}

                <UserForm
                    initialData={{ firstName: '', lastName: '', email: '', isAdmin: false }}
                    onSubmit={submitCreateHandler}
                    isEdit={false} 
                    isLoading={isLoading} 
                />
                
                {isLoading && (
                    <div className='mt-4 text-center'>
                        <TailwindSpinner /> 
                        <p className='text-sm text-gray-600 mt-2'>Creating new user...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCreatePage;