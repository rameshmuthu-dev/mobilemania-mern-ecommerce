import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

import Spinner from '../../ui/Spinner';
import Message from '../../ui/Message';
import Button from '../../ui/Button';

import { 
    getCarousels, 
    deleteCarousel, 
    clearCarouselSuccess,
    clearCarouselError
} from '../../../redux/slices/carouselSlice';

const AdminCarouselListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { 
        carousels, 
        loading, 
        error, 
        success, 
        message 
    } = useSelector((state) => state.carousel);
    
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }

        if (success) {
            toast.success('Operation successful!');
            dispatch(clearCarouselSuccess());
        }
        
        if (error) {
            toast.error(error);
            dispatch(clearCarouselError());
        }

        dispatch(getCarousels());
    }, [dispatch, navigate, user, success, error]);

    const deleteHandler = (id) => {
        if (window.confirm('Are you sure you want to delete this carousel item?')) {
            dispatch(deleteCarousel(id));
        }
    };

    const createHandler = () => {
        navigate('/admin/carousel/create');
    };

    const editHandler = (id) => {
        navigate(`/admin/carousel/${id}/edit`);
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-3xl font-bold text-gray-800'>Carousel Items ({carousels.length})</h1>
                <Button 
                    variant="primary" 
                    onClick={createHandler}
                    className='flex items-center space-x-2'
                >
                    <FaPlus />
                    <span>Create Carousel</span>
                </Button>
            </div>

            {error && <Message variant="danger">{message || error}</Message>}

            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Linked Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {carousels.map((carousel) => (
                            <tr key={carousel._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {carousel._id?.substring(0, 8)}...
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img 
                                        src={carousel.image} 
                                        alt={carousel.title} 
                                        className="h-10 w-auto object-cover rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {carousel.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {carousel.productId && carousel.productId._id ? (
                                        <Link 
                                            to={`/product/${carousel.productId._id}`}
                                            className="text-blue-600 hover:underline"
                                        > 
                                            {carousel.productId.name || 'View Product'}
                                        </Link>
                                    ) : (
                                        <span className="text-red-500 font-medium">Link Error / Missing ID</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <Button 
                                            variant="info"
                                            onClick={() => editHandler(carousel._id)}
                                            className='p-2'
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="danger"
                                            onClick={() => deleteHandler(carousel._id)}
                                            className='p-2'
                                        >
                                            <FaTrash />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {carousels.length === 0 && !loading && (
                <Message variant="info" className="mt-4">No carousel items found.</Message>
            )}
        </div>
    );
};

export default AdminCarouselListPage;