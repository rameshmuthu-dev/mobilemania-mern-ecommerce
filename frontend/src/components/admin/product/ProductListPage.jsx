import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Button from '../../ui/Button'

import { 
    getAdminProducts, 
    deleteProduct, 
    clearAdminProductStatus 
} from '../../../redux/slices/adminProductSlice'; 

import Spinner from '../../ui/Spinner'; 
import Message from '../../ui/Message'
import Pagination from '../../ui/Pagination'

const ProductListPage = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const limit = 25;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { 
        products, loading, error, totalPages, totalProducts, 
        isDeleting, deleteSuccess, deleteError 
    } = useSelector((state) => state.adminProduct);

    const { user } = useSelector((state) => state.auth); 

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }

        if (deleteSuccess || deleteError) {
             dispatch(clearAdminProductStatus());
             if (deleteSuccess) {
                 dispatch(getAdminProducts({ page: pageNumber, limit }));
             }
        }
        
        if (!deleteSuccess) { 
             dispatch(getAdminProducts({ page: pageNumber, limit }));
        }

    }, [dispatch, navigate, user, pageNumber, deleteSuccess, deleteError]);
    
    const handlePageChange = (page) => {
        setPageNumber(page);
    };

    const deleteHandler = (id) => {
        if (window.confirm('Are you sure you want to delete this product? This is irreversible.')) {
            dispatch(deleteProduct(id));
        }
    };
    
    const createProductHandler = () => {
        navigate('/admin/products/create');
    };
    
    const editHandler = (id) => {
        navigate(`/admin/products/${id}/edit`);
    };

    return (
        <div className="container mx-auto p-4">
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
                    Products ({totalProducts})
                </h1>
                <Button 
                    variant='primary' 
                    className='py-2 px-4 text-sm' 
                    onClick={createProductHandler}
                >
                    <FaPlus className='mr-2' /> Create Product
                </Button>
            </div>
            
            {deleteError && <Message variant='danger'>{deleteError}</Message>}
            {deleteSuccess && <Message variant='success'>Product deleted successfully!</Message>}

            {loading ? (
                <Spinner />
            ) : error ? (
                <Message variant='danger'>{error}</Message>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NAME</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PRICE</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CATEGORY</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">STOCK</th>
                                    <th className="px-6 py-3">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs'>
                                            {product._id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            Rs. {product.price ? product.price.toFixed(2) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {product.countInStock}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* 🛑 Buttons-க்கு space மற்றும் Horizontal alignment-க்காக flex மற்றும் justify-end சேர்க்கப்பட்டுள்ளது */}
                                            <div className='flex justify-end'>
                                                <Button
                                                    variant='outline' 
                                                    className='p-2 text-xs mr-2' 
                                                    onClick={() => editHandler(product._id)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                
                                                <Button 
                                                    variant='danger' 
                                                    className='p-2 text-xs' 
                                                    onClick={() => deleteHandler(product._id)}
                                                    isLoading={isDeleting}
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
                    
                    <Pagination 
                        page={pageNumber} 
                        pages={totalPages} 
                        onPageChange={handlePageChange} 
                    />
                </>
            )}
        </div>
    );
};

export default ProductListPage;