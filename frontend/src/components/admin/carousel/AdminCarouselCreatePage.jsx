import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Spinner from '../../ui/Spinner';
import Message from '../../ui/Message';
import Button from '../../ui/Button';

import { 
    createCarousel, 
    clearCarouselSuccess,
    clearCarouselError 
} from '../../../redux/slices/carouselSlice';

import { getProductIdsAndNames } from '../../../redux/slices/adminProductSlice'; 


const AdminCarouselCreatePage = () => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [productId, setProductId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { 
        loading: loadingCreate, 
        error: errorCreate, 
        success: successCreate 
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

        if (successCreate) {
            toast.success('Carousel item created successfully!');
            dispatch(clearCarouselSuccess());
            navigate('/admin/carousel');
            return;
        }
        
        if (errorCreate) {
            toast.error(errorCreate);
            dispatch(clearCarouselError());
            return;
        }
        
    }, [dispatch, navigate, user, successCreate, errorCreate, productsList.length, loadingProducts, errorProducts]);

    const fileChangeHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setImagePreview('');
        }
    };

    const handleProductSelect = (id, name) => {
        setProductId(id);
        setSearchTerm(name);
    };

    const submitHandler = (e) => {
        e.preventDefault();

        if (!title || !productId || !imageFile) {
            toast.error('Please fill in Title, select a Linked Product, and upload an Image.');
            return;
        }
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('productId', productId);
        formData.append('image', imageFile);

        dispatch(createCarousel(formData));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <Button 
                onClick={() => navigate('/admin/carousel')}
                variant="light"
                className="mb-4"
            >
                Go Back
            </Button>
            <h1 className='text-3xl font-bold text-gray-800 mb-6'>Create Carousel Item</h1>

            {loadingCreate && <Spinner />}
            {errorCreate && <Message variant="danger">{errorCreate}</Message>}
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
                            placeholder="Enter main title"
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
                            placeholder="Enter secondary text"
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
                            Image <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            id="image"
                            onChange={fileChangeHandler}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                            accept="image/*"
                            required
                        />
                        {imagePreview && (
                            <div className="mt-4 border border-gray-200 p-2 rounded-lg inline-block">
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
                        disabled={loadingCreate}
                    >
                        {loadingCreate ? 'Creating...' : 'Create Carousel Item'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdminCarouselCreatePage;