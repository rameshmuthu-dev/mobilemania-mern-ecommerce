import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
    getUserDetailsByAdmin, 
    updateUserByAdmin, 
    reset 
} from '../../../redux/slices/authSlice'; 

import UserForm from '../ui/UserForm';
import Button from '../../ui/Button';
import Spinner from '../../ui/Spinner';

const UserEditPage = () => {
    const { id: userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { 
        user, 
        userToEdit, 
        isLoading, 
        isError, 
        message 
    } = useSelector((state) => state.auth);

    const [updateSuccess, setUpdateSuccess] = useState(false);
    
    // TailwindAlert Component நீக்கப்பட்டுள்ளது
    const CustomAlert = ({ children, variant }) => (
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
            return; 
        }
        
        if (!userToEdit || userToEdit._id !== userId) {
            dispatch(getUserDetailsByAdmin(userId));
        }

        if (updateSuccess) {
            toast.success('User updated successfully!');
            navigate('/admin/users');
            dispatch(reset()); 
            setUpdateSuccess(false);
        }

        return () => {}; 
    }, [dispatch, navigate, userId, user, userToEdit, isError, message, updateSuccess]);

    const submitUpdateHandler = (formData) => {
        const { firstName, lastName, email, isAdmin } = formData;
        
        dispatch(updateUserByAdmin({
            userId,
            userData: { firstName, lastName, email, isAdmin }
        }))
        .unwrap() 
        .then(() => {
            setUpdateSuccess(true);
        })
        .catch(() => {});
    };
    
    const headerTitle = userToEdit && userToEdit._id === userId 
        ? `Edit User: ${userToEdit.firstName} ${userToEdit.lastName}`
        : `Edit User: ${userId}`;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Link to='/admin/users'>
                <Button 
                    variant="secondary" 
                    className='mb-4 flex items-center !py-2 !px-4'
                >
                    <FaArrowLeft className='mr-2' /> Go Back
                </Button>
            </Link>

            <div className="max-w-md mx-auto bg-white p-8 shadow-xl rounded-lg">
                <h1 className='text-3xl font-bold mb-6 text-gray-800 text-center'>{headerTitle}</h1>

                {isLoading && !userToEdit && <Spinner />}
                
                {userToEdit && userToEdit._id === userId ? (
                    <UserForm
                        initialData={userToEdit}
                        onSubmit={submitUpdateHandler}
                        isEdit={true} 
                        isLoading={isLoading}
                    />
                ) : (
                    !isLoading && !isError && <p className='text-center text-gray-500'>Fetching user details...</p>
                )}
            </div>
        </div>
    );
};

export default UserEditPage;