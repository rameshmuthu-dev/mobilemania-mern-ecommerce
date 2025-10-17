import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { 
    getProductReviews, 
    createNewReview, 
    checkIfUserOrderedProduct, 
    deleteReview,
    updateReview 
} from '../../redux/slices/reviewSlice' 

import Message from '../ui/Message'; 
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';

import StarRating from '../ui/StarRating';       
import StarRatingInput from '../ui/StarRatingInput'; 


const ProductReviews = ({ productId, isAdmin }) => {
    const dispatch = useDispatch();
    
    const { user: userInfo } = useSelector(state => state.auth); 
    
    const { reviews, isLoading, isError, message, hasUserOrdered } = useSelector(state => state.review); 
    
    const [rating, setRating] = useState(0); 
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [editingReviewId, setEditingReviewId] = useState(null); 

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
        : 0;
    
    useEffect(() => {
        if (productId) {
            dispatch(getProductReviews(productId));

            if (userInfo && !isAdmin) { 
                dispatch(checkIfUserOrderedProduct(productId));
            }
        }
    }, [dispatch, productId, userInfo, isAdmin]);

    const currentUserReview = userInfo 
        ? reviews.find(review => review.user && review.user._id === userInfo._id) 
        : null;

    const hasReviewed = !!currentUserReview;
    
    const startEditHandler = (review) => {
        setEditingReviewId(review._id); 
        setRating(review.rating);     
        setComment(review.comment);   
        
        const formElement = document.getElementById('review-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    const cancelEditHandler = () => {
        setEditingReviewId(null); 
        setRating(0);           
        setComment('');         
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (rating === 0 || comment.trim() === '') {
            toast.error("Please provide a rating and a comment.");
            return;
        }

        setIsSubmitting(true);
        
        if (editingReviewId) {
            const resultAction = await dispatch(updateReview({ 
                reviewId: editingReviewId, 
                rating, 
                comment 
            }));
            
            if (updateReview.fulfilled.match(resultAction)) {
                cancelEditHandler(); 
                await dispatch(getProductReviews(productId));
                dispatch(checkIfUserOrderedProduct(productId));
            }
            
        } else {
            const resultAction = await dispatch(createNewReview({ 
                productId, 
                rating, 
                comment 
            }));
            
            if (createNewReview.fulfilled.match(resultAction)) {
                setRating(0); 
                setComment('');
                dispatch(checkIfUserOrderedProduct(productId));
            }
        }
        
        setIsSubmitting(false);
    };
    
    const deleteHandler = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete your review?')) {
            const resultAction = await dispatch(deleteReview(reviewId));
            
            if (deleteReview.fulfilled.match(resultAction)) {
                toast.success("Review deleted successfully!");
                await dispatch(getProductReviews(productId));
                dispatch(checkIfUserOrderedProduct(productId)); 
            }
        }
    };
    
    const canWriteNewReview = hasUserOrdered && !hasReviewed;

    return (
        <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-3xl font-bold mb-6 border-b-2 pb-2 text-lime-600">
                Customer Reviews ({reviews.length})
            </h2>
            
            {reviews.length > 0 && (
                <div className="mb-6 flex items-center space-x-3 p-4 bg-lime-50 rounded-lg border border-lime-200 shadow-sm">
                    <StarRating value={averageRating} /> 
                    
                    <span className="text-xl font-bold text-lime-700">
                        {averageRating}
                    </span>
                    
                    <span className="text-gray-600">
                        ({reviews.length} total reviews)
                    </span>
                </div>
            )}

            {isLoading && <Spinner />}
            {isError && <Message variant="danger">{message}</Message>}

            {reviews.length === 0 && !isLoading ? (
                <Message variant="info">No Reviews Yet. Be the first to review!</Message>
            ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2"> 
                    {reviews.map((review) => (
                        <div key={review._id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                                <strong className="text-gray-800 text-lg">
                                    {review.user ? review.user.name : 'Anonymous'}
                                </strong>
                                <span className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <StarRating value={review.rating} /> 
                            <p className="mt-2 text-gray-700 leading-relaxed">{review.comment}</p>
                            
                            {userInfo && review.user && review.user._id === userInfo._id && !isAdmin && (
                                <div className="mt-3 flex space-x-3 border-t pt-3">
                                    <button 
                                        onClick={() => startEditHandler(review)} 
                                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                        disabled={editingReviewId === review._id || isSubmitting}
                                    >
                                        {editingReviewId === review._id ? 'Editing...' : 'Edit'}
                                    </button>
                                    
                                    <button 
                                        onClick={() => deleteHandler(review._id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        disabled={isSubmitting}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            <hr className="mt-8 mb-6 border-gray-200" />

            {!isAdmin ? (
                <div id="review-form" className="p-6 bg-white border rounded-xl shadow-md">
                    <h3 className="text-2xl font-semibold mb-4 text-lime-700">
                        {editingReviewId ? 'Edit Your Review' : 'Write a Review'} 
                    </h3>
                    
                    {!userInfo ? ( 
                        <Message variant="info">
                            Please <Link to="/login" className="text-lime-600 font-semibold hover:underline">sign in</Link> to write a review.
                        </Message>
                    ) : 
                        editingReviewId ? (
                            <Message variant="info">You are currently editing your review. Scroll up to see your existing review and confirm your changes.</Message>
                        ) : 
                        hasReviewed ? (
                            <Message variant="warning">You have already submitted a review for this product. You can **Edit** it above.</Message>
                        ) : 
                        !hasUserOrdered ? ( 
                            <Message variant="info">
                                You must have **purchased this product** to write a review.
                            </Message>
                        ) : null 
                    }
                    
                    {(editingReviewId || canWriteNewReview) ? (
                        <form onSubmit={submitHandler} className="mt-4">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Rating</label>
                                
                                <StarRatingInput 
                                    rating={rating}
                                    setRating={setRating}
                                    disabled={isSubmitting} 
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Comment</label>
                                <textarea
                                    rows="4"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-lime-500 focus:border-lime-500"
                                    placeholder="Share your thoughts about the product..."
                                    required
                                    disabled={isSubmitting} 
                                ></textarea>
                            </div>
                            
                            <div className="flex space-x-3">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting || rating === 0} 
                                    variant="gradient"
                                >
                                    {isSubmitting 
                                        ? (editingReviewId ? 'Updating...' : 'Submitting...') 
                                        : (editingReviewId ? 'Update Review' : 'Submit Review')}
                                </Button>
                                
                                {editingReviewId && (
                                    <Button 
                                        type="button" 
                                        onClick={cancelEditHandler}
                                        variant="secondary"
                                        disabled={isSubmitting}
                                    >
                                        Cancel Edit
                                    </Button>
                                )}
                            </div>
                        </form>
                    ) : null}
                </div>
            ) : (
                <Message variant="info">
                    You are logged in as an **Admin**. You can view all customer reviews above, but you cannot submit a new review for this product.
                </Message>
            )}
        </div>
    );
};

export default ProductReviews;