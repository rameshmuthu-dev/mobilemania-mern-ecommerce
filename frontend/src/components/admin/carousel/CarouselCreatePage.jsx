

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

import { createCarousel, clearCarouselSuccess } from '../../../redux/slices/carouselSlice'; 
import Message from '../../ui/Message';
import Button from '../../ui/Button'; 

const CarouselCreatePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Form States
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [link, setLink] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // State for displaying a local image preview
    
    // Redux state for creation status
    const { loading, error, success } = useSelector(state => state.carousel || {});

    // Step 1: Handle success, notification, and redirection
    useEffect(() => {
        if (success) {
            alert('Carousel Item created successfully!'); 
            dispatch(clearCarouselSuccess());
            navigate('/admin/carousels'); // Redirect back to the list screen
        }
    }, [dispatch, navigate, success]);

    // Step 2: Form Submission Handler
    const submitHandler = (e) => {
        e.preventDefault();
        
        if (!title || !imageFile) {
            alert('Title and Image are required.');
            return;
        }

        // Create FormData object to send both text fields and the image file
        const formData = new FormData();
        // 'image' field name must match the name used in your backend upload middleware
        formData.append('image', imageFile); 
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('link', link);
        
        dispatch(createCarousel(formData));
    };

    // Step 3: File change and preview handler
    const fileChangeHandler = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        
        // Create an image preview URL for local display
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    return (
        // Outer Wrapper for Centering and Vertical Spacing
        <div className="py-10 flex justify-center">
            
            {/* Inner Content Container: Sets Max Width and Responsive Padding */}
            <div className="w-full max-w-xl lg:max-w-2xl px-4"> 
                <Link to="/admin/carousels" className="text-gray-600 hover:text-gray-800 mb-4 inline-block">
                    ← Go Back to Carousels
                </Link>
                
                <h1 className="text-3xl font-bold mb-6">Create New Carousel Item</h1>
                
                {/* Display Error Message */}
                {error && <Message variant="danger">{error}</Message>}

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
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image (Required)</label>
                        <input 
                            type="file" 
                            id="image"
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-3"
                            onChange={fileChangeHandler}
                            accept="image/*"
                            required
                        />
                        {imagePreview && (
                            <div className="mt-2 p-2 border border-gray-200 rounded-lg max-w-sm">
                                <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                                <img 
                                    src={imagePreview} 
                                    alt="Image Preview" 
                                    className="w-full h-auto max-h-40 object-cover rounded-md" 
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Submit Button (using your Button.jsx component) */}
                    <Button 
                        type="submit" 
                        variant="primary" 
                        isLoading={loading}
                        // Disable if loading or if essential fields are missing
                        disabled={loading || !title || !imageFile} 
                        className="w-full !py-3"
                    >
                        Create Carousel
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CarouselCreatePage;