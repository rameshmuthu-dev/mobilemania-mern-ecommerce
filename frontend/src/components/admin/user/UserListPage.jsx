import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaCheck, FaTrash, FaEdit, FaSpinner, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUserByAdmin, reset } from '../../../redux/slices/authSlice';
import { toast } from 'react-toastify';

import Button from '../../ui/Button'; 

const UserListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { 
        user, 
        users, 
        isLoading, 
        isError, 
        message,
    }
    = useSelector((state) => state.auth);

    const [deletingId, setDeletingId] = React.useState(null);
    const [filterRole, setFilterRole] = React.useState('all');

    useEffect(() => {
        if (user && user.isAdmin) {
            dispatch(getAllUsers());
        } else {
            navigate('/login');
        }

        if (isError) {
            toast.error(message);
            dispatch(reset());
        }

        return () => {
            dispatch(reset()); 
        };
    }, [dispatch, navigate, user, isError, message]);

    const deleteHandler = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            if (id === user._id) {
                toast.error('You cannot delete yourself!');
                return;
            }
            setDeletingId(id);
            dispatch(deleteUserByAdmin(id))
            .finally(() => setDeletingId(null));
        }
    };
    
    const filteredUsers = users.filter(u => {
        if (filterRole === 'all') {
            return true;
        }
        if (filterRole === 'admin') {
            return u.isAdmin === true;
        }
        if (filterRole === 'user') {
            return u.isAdmin === false;
        }
        return true;
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Users List</h1>
                
                <div className="flex items-center space-x-4">
                    
                    <div className='flex items-center'>
                        <label htmlFor="role-filter" className="mr-2 text-gray-700 font-medium text-sm hidden sm:block">
                            Filter by Role:
                        </label>
                        <select
                            id="role-filter"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-lime-500 focus:border-lime-500 transition duration-150 text-sm"
                        >
                            <option value="all">All Users</option>
                            <option value="admin">Admins Only</option>
                            <option value="user">Standard Users Only</option>
                        </select>
                    </div>

                    <Link to='/admin/user/create'>
                        <Button 
                            variant="primary" 
                            className='flex items-center space-x-2 shadow-md hover:shadow-lg transition duration-300'
                        >
                            <FaPlus />
                            <span>Create User</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {isLoading && !users.length ? (
                <div className="flex justify-center items-center py-6">
                    <FaSpinner className="animate-spin h-6 w-6 text-lime-500" />
                </div>
            ) : isError ? (
                <p className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{message}</p>
            ) : filteredUsers.length === 0 ? (
                <p className="text-center text-lg text-gray-500 mt-10">No users found for this filter.</p>
            ) : (
                <div className="overflow-x-auto shadow-xl sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    NAME
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    EMAIL
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ADMIN
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u._id.substring(0, 10)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-lime-600 hover:text-lime-800">
                                        <a href={`mailto:${u.email}`}>{u.email}</a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {u.isAdmin ? (
                                            <FaCheck className="text-green-500" />
                                        ) : (
                                            <FaTimes className="text-red-500" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center">
                                        <Link to={`/admin/user/${u._id}/edit`}>
                                            <Button 
                                                variant="outline"
                                                className="!py-2 !px-3 !text-xs border-none"
                                            >
                                                <FaEdit className='w-4 h-4 text-blue-500 hover:text-blue-700' />
                                            </Button>
                                        </Link>
                                        
                                        <div className="w-2"></div>
                                        
                                        <Button
                                            variant='danger'
                                            onClick={() => deleteHandler(u._id)}
                                            disabled={
                                                u._id === user._id || 
                                                u.isAdmin || 
                                                deletingId === u._id
                                            }
                                            isLoading={deletingId === u._id}
                                            className="!py-2 !px-3 !text-xs"
                                        >
                                            <FaTrash className='w-4 h-4' />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserListPage;