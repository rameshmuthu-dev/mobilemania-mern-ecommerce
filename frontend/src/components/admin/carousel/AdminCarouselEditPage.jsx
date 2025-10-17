import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import Spinner from '../../ui/Spinner';
import Message from '../../ui/Message';
import Button from '../../ui/Button';

import { 
    getCarouselDetails,
    updateCarousel, 
    clearCarouselSuccess,
    clearCarouselError 
} from '../../../redux/slices/carouselSlice';

import { getProductIdsAndNames } from '../../../redux/slices/adminProductSlice'; 


const AdminCarouselEditPage = () => {
    const { id: carouselId } = useParams();
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [productId, setProductId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [searchTerm, setSearchTerm] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { 
        loading: loadingDetails, 
        error: errorDetails, 
        carousel, 
        loading: loadingUpdate, 
        error: errorUpdate, 
        success: successUpdate 
    } = useSelector((state) => state.carousel);

    const { user } = useSelector((state) => state.auth);
    
    const { 
        productIds: productsList, 
        productIdsLoading: loadingProducts, 
        productIdsError: errorProducts 
    } = useSelector((state) => state.adminProduct); 

    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) {
             return [];
        }
        
        const lowerSearch = searchTerm.toLowerCase();
        
        if (!Array.isArray(productsList)) return [];

        return productsList
            .filter(product =>
                product.name.toLowerCase().includes(lowerSearch)
            )
            .slice(0, 10);
    }, [searchTerm, productsList]);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }

        if (productsList.length === 0 && !loadingProducts && !errorProducts) {
             dispatch(getProductIdsAndNames());
        }

        if (successUpdate) {
            toast.success('Carousel item updated successfully!');
            dispatch(clearCarouselSuccess());
            navigate('/admin/carousel');
            return;
        }
        
        if (errorUpdate) {
            toast.error(errorUpdate);
            dispatch(clearCarouselError());
            return;
        }
        
        if (!carousel._id || carousel._id !== carouselId) {
            dispatch(getCarouselDetails(carouselId));
        }
        
    }, [dispatch, navigate, user, carouselId, successUpdate, errorUpdate, carousel._id, productsList.length, loadingProducts, errorProducts]);

    useEffect(() => {
        if (carousel._id && carousel._id === carouselId) {
            setTitle(carousel.title || '');
            setSubtitle(carousel.subtitle || '');
            
            const finalProductId = carousel.productId?._id || carousel.productId || '';
            setProductId(finalProductId);
            
            if (carousel.productId && carousel.productId.name) {
                setSearchTerm(carousel.productId.name);
            }
            
            setImagePreview(carousel.image || '');
        }
    }, [carousel, carouselId]);

    const fileChangeHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
        }
    };

    const handleProductSelect = (id, name) => {
        setProductId(id);
        setSearchTerm(name);
    };

    const submitHandler = (e) => {
        e.preventDefault();

        if (!title || !productId) {
            toast.error('Please fill in Title and select a Linked Product.');
            return;
        }
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('productId', productId);
        
        if (imageFile) {
            formData.append('image', imageFile);
        }

        dispatch(updateCarousel({ id: carouselId, formData }));
    };

    if (loadingDetails) {
        return <Spinner />;
    }

    if (errorDetails) {
        return <Message variant="danger">{errorDetails}</Message>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <Button 
                onClick={() => navigate('/admin/carousel')}
                variant="light"
                className="mb-4"
            >
                Go Back
            </Button>
            <h1 className='text-3xl font-bold text-gray-800 mb-6'>Edit Carousel Item: {carousel.title}</h1>

            {(loadingUpdate || loadingDetails) && <Spinner />}
            {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
            {errorProducts && <Message variant="danger">{`Product List Error: ${errorProducts}`}</Message>}


            <div className="bg-white p-6 rounded-lg shadow-lg">
                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
                            Subtitle (Optional)
                        </label>
                        <input
                            type="text"
                            id="subtitle"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="productSearch" className="block text-sm font-medium text-gray-700">
                            Linked Product <span className="text-red-500">*</span>
                            {loadingProducts && <span className="text-xs text-gray-500 ml-2">(Loading products...)</span>}
                        </label>
                        <input
                            type="text"
                            id="productSearch"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="Type to search for a product name..."
                            required
                        />
                        <input type="hidden" value={productId} required />

                        {filteredProducts.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => handleProductSelect(product._id, product.name)}
                                        className={`p-2 cursor-pointer hover:bg-gray-100 ${productId === product._id ? 'bg-indigo-50 font-semibold' : ''}`}
                                    >
                                        {product.name}
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className='text-xs text-gray-500 mt-1'>
                            Selected Product ID: {productId || 'None'}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                            Image (Leave blank to keep current image)
                        </label>
                        <input
                            type="file"
                            id="image"
                            onChange={fileChangeHandler}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                            accept="image/*"
                        />
                        {imagePreview && (
                            <div className="mt-4 border border-gray-200 p-2 rounded-lg inline-block">
                                <p className='text-xs text-gray-600 mb-1'>Current Image:</p>
                                <img 
                                    src={imagePreview} 
                                    alt="Image Preview" 
                                    className="h-32 w-auto object-cover rounded-md" 
                                />
                            </div>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        variant="success" 
                        className="w-full py-2"
                        disabled={loadingUpdate}
                    >
                        {loadingUpdate ? 'Updating...' : 'Update Carousel Item'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdminCarouselEditPage;