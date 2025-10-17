import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash } from 'react-icons/fa';

import Message from '../../ui/Message'; 
import Spinner from '../../ui/Spinner'; 
import Button from '../../ui/Button'; 

import { listAllReviewsForAdmin, deleteReview } from '../../../redux/slices/reviewSlice'; 

const AdminReviewListPage = () => {
    const dispatch = useDispatch();
    
    const [filterRating, setFilterRating] = useState('all'); 

    const reviewState = useSelector((state) => state.review); 
    const { 
        isLoading, 
        isError, 
        message, 
        allReviews 
    } = reviewState; 

    const { 
        isLoading: loadingDelete, 
        isError: errorDelete,
        message: deleteMessage 
    } = reviewState; 

    useEffect(() => {
        dispatch(listAllReviewsForAdmin());
    }, [dispatch]); 

    const deleteHandler = (id) => {
        if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            dispatch(deleteReview(id)); 
        }
    };

    const filteredReviews = allReviews.filter(review => {
        if (filterRating === 'all') {
            return true; 
        }
        return review.rating === Number(filterRating); 
    });

    return (
        <div className="p-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Review Management 📝</h1>
            
            <div className="mb-6 flex flex-wrap items-center space-x-4">
                <label htmlFor="ratingFilter" className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">Filter by Rating:</label>
                <select
                    id="ratingFilter"
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-lime-500 focus:border-lime-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="all">All Reviews ({allReviews.length})</option>
                    <option value="5">5 Stars </option>
                    <option value="4">4 Stars </option>
                    <option value="3">3 Stars </option>
                    <option value="2">2 Stars </option>
                    <option value="1">1 Star </option>
                </select>
                <span className="text-gray-600 dark:text-gray-400 font-semibold mt-2 md:mt-0">
                    Showing {filteredReviews.length} filtered reviews.
                </span>
            </div>

            {isLoading && <Spinner />} 
            {isError && <Message variant='danger'>{message}</Message>}

            {errorDelete && <Message variant='danger'>Deletion Error: {deleteMessage}</Message>}
            
            {(filteredReviews.length > 0 && !isLoading) ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-md dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PRODUCT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">USER</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">RATING</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">COMMENT</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {filteredReviews.map((review) => (
                                <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[100px] truncate">{review._id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-[150px] truncate">
                                        {review.product?.name || 'N/A'} 
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[120px] truncate">
                                        {review.user?.name || 'Deleted User'} 
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-bold">{review.rating} ⭐</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {review.comment}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium">
                                        <Button
                                            onClick={() => deleteHandler(review._id)}
                                            variant='danger'
                                            isLoading={loadingDelete}
                                            disabled={loadingDelete}
                                            className="p-1 px-2 text-xs"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !isLoading && !isError && (
                    <Message variant="info">
                        No reviews found for the selected filter or no reviews have been submitted yet.
                    </Message>
                )
            )}
        </div>
    );
};

export default AdminReviewListPage;