// src/screens/admin/carousel/CarouselEditPage.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useParams } from 'react-router-dom';
// 💡 Adjust paths as necessary for your Redux slice and UI components
import { 
    getCarouselDetails, 
    updateCarousel, 
    clearCarouselSuccess,
    clearCarouselDetails
} from '../../../redux/slices/carouselSlice'; 
import Message from '../../ui/Message';
import Spinner from '../../ui/Spinner'; 
import Button from '../../ui/Button'; 

const CarouselEditPage = () => {
    
    const { id: carouselId } = useParams(); 
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Form States
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [link, setLink] = useState('');
    const [imageFile, setImageFile] = useState(null); // Stores the NEW file if selected
    const [imagePreview, setImagePreview] = useState(null); // Stores the URL for preview (either saved or new)
    
    // Redux state access
    const { 
        loading: detailsLoading, 
        error: detailsError, 
        carousel: carouselDetails, 
        loading: updateLoading,
        error: updateError,
        success: updateSuccess
    } = useSelector(state => state.carousel || {});


    // STEP 1: Fetch Existing Data and Handle Update Success
    useEffect(() => {
        // Handle successful update and redirect
        if (updateSuccess) {
            alert('Carousel Item updated successfully!'); 
            dispatch(clearCarouselSuccess());
            navigate('/admin/carousels');
        } 
        
        // If details are not loaded or don't match the current ID, fetch them
        else if (!carouselDetails || carouselDetails._id !== carouselId) {
            dispatch(getCarouselDetails(carouselId));
        } 
        
        // Once details are loaded, populate the form states
        else {
            setTitle(carouselDetails.title || '');
            setSubtitle(carouselDetails.subtitle || '');
            setLink(carouselDetails.link || '');
            // Set the current saved image URL for preview
            setImagePreview(carouselDetails.image || null); 
        }

        // Cleanup: Clear details when leaving the page
        return () => {
             dispatch(clearCarouselDetails());
        };

    }, [dispatch, navigate, carouselDetails, carouselId, updateSuccess]);


    // STEP 2: Submission Handler (Update Logic)
    const submitHandler = (e) => {
        e.preventDefault();
        
        if (!title) {
            alert('Title is required.');
            return;
        }

        // Use FormData to send both text fields and the optional new image
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('link', link);
        
        // ONLY append the 'image' field if a NEW file has been selected
        if (imageFile) {
            formData.append('image', imageFile); 
        }

        dispatch(updateCarousel({ id: carouselId, data: formData }));
    };

    // STEP 3: File Change and Preview Handler
    const fileChangeHandler = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        
        // If a new file is selected, show its local preview
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } 
        // If the input is cleared, revert to the current saved image URL
        else if (carouselDetails) {
             setImagePreview(carouselDetails.image || null);
        }
    };

    return (
        <div className="py-10 flex justify-center">
            <div className="w-full max-w-xl lg:max-w-2xl px-4"> 
                <Link to="/admin/carousels" className="text-gray-600 hover:text-gray-800 mb-4 inline-block">
                    ← Go Back to Carousels
                </Link>
                
                <h1 className="text-3xl font-bold mb-6">Edit Carousel Item #{carouselId ? carouselId.substring(0, 8) : ''}</h1>
                
                {/* Display Messages */}
                {updateError && <Message variant="danger">{updateError}</Message>}
                {detailsError && <Message variant="danger">{detailsError}</Message>}

                {/* Loading/Error State for Fetching Details */}
                {detailsLoading ? (
                    <Spinner /> // Using your Spinner component
                ) : detailsError ? (
                    <Message variant="danger">{detailsError}</Message>
                ) : (
                    <form onSubmit={submitHandler} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                        
                        {/* Title Field */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title (Required)</label>
                            <input 
                                type="text" 
                                id="title"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-lime-500 focus:border-lime-500"
                                placeholder="Enter title for the banner"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Subtitle Field */}
                        <div>
                            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">Subtitle</label>
                            <input 
                                type="text" 
                                id="subtitle"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-lime-500 focus:border-lime-500"
                                placeholder="Optional description"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                            />
                        </div>

                        {/* Link Field */}
                        <div>
                            <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link URL</label>
                            <input 
                                type="text" 
                                id="link"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-lime-500 focus:border-lime-500"
                                placeholder="/product/123 or /category/electronics"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                            />
                        </div>
                        
                        {/* Image Upload Field and Preview */}
                        <div className="flex flex-col space-y-3">
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Change Image (Optional)</label>
                            <input 
                                type="file" 
                                id="image"
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-3"
                                onChange={fileChangeHandler}
                                accept="image/*"
                            />
                            {imagePreview && (
                                <div className="mt-2 p-2 border border-gray-200 rounded-lg max-w-sm">
                                    <p className="text-xs text-gray-500 mb-1">Current/New Image Preview:</p>
                                    <img 
                                        src={imagePreview} 
                                        alt="Image Preview" 
                                        className="w-full h-auto max-h-40 object-cover rounded-md" 
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Submit Button (using the reusable Button component) */}
                        <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={updateLoading}
                            disabled={updateLoading || !title} 
                            className="w-full !py-3"
                        >
                            {updateLoading ? 'Updating...' : 'Update Carousel'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CarouselEditPage;