import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCloudUploadAlt, FaEdit, FaTrash } from 'react-icons/fa';

import Spinner from '../../ui/Spinner'; 
import Message from '../../ui/Message'; 
import { 
    getProductDetails, 
    updateProduct, 
    clearUpdateStatus 
} from '../../../redux/slices/productSlice'; 

const MAX_IMAGES = 5;

const EditProductPage = () => {
    const { id: productId } = useParams(); 
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // --- State Variables ---
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [currentImageUrls, setCurrentImageUrls] = useState([]); // Existing URLs from DB
    const [imagesFilesToAdd, setImagesFilesToAdd] = useState([]); // New File objects to upload
    const [imagePreviews, setImagePreviews] = useState([]); // Local URLs for new file previews
    
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState(''); 
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    // Specification States (Matching CreateProductPage names)
    const [processor, setProcessor] = useState('');
    const [ram, setRam] = useState('');
    const [storage, setStorage] = useState('');
    const [display, setDisplay] = useState('');
    const [camera, setCamera] = useState('');
    const [battery, setBattery] = useState('');
    const [os, setOs] = useState('');
    const [color, setColor] = useState('');
    const [graphicsCard, setGraphicsCard] = useState('');
    
    // --- Redux State Selection (Data & Warning Fix) ---
    const productDetailsState = useSelector(state => state.products.productDetails, shallowEqual);
    const loadingDetails = useSelector(state => state.products.loading);
    const errorDetails = useSelector(state => state.products.error);
    const currentProduct = productDetailsState; 
    
    const { isUpdating: loadingUpdate, updateError: errorUpdate, updateSuccess: successUpdate } = useSelector(state => state.products || {});
    
    // --- useEffect: Data Fetching and State Initialization ---
    useEffect(() => {
        if (successUpdate) {
            toast.success('Product updated successfully!');
            dispatch(clearUpdateStatus());
            navigate('/admin/products');
        } 
        
        // Fetch product details if not loaded or if a different product is loaded
        else if (!currentProduct || currentProduct._id !== productId) {
            dispatch(getProductDetails(productId));
        } 
        
        // Initialize state variables with fetched data
        else {
            setName(currentProduct.name || '');
            setPrice(currentProduct.price || 0);
            setBrand(currentProduct.brand || '');
            setCategory(currentProduct.category || '');
            setCountInStock(currentProduct.countInStock || 0);
            setDescription(currentProduct.description || '');
            setCurrentImageUrls(currentProduct.images || []); 
            
            const specs = currentProduct.specs || {}; 
            setProcessor(specs.processor || '');
            setRam(specs.ram || '');
            setStorage(specs.storage || '');
            setDisplay(specs.display || '');
            setCamera(specs.camera || '');
            setBattery(specs.battery || '');
            setOs(specs.os || '');
            setColor(specs.color || '');
            setGraphicsCard(specs.graphicsCard || '');
        }

    }, [dispatch, navigate, productId, successUpdate, currentProduct, errorDetails]);
    
    // --- Cleanup for local image URLs ---
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    // --- Handlers ---
    const selectFileHandler = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = currentImageUrls.length + imagesFilesToAdd.length + files.length;
        if (totalImages > MAX_IMAGES) {
            toast.error(`You can only have a maximum of ${MAX_IMAGES} images (existing + new).`);
            return;
        }

        if (!files.length) return;

        setImagesFilesToAdd(prevFiles => [...prevFiles, ...files]); 
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
        
        e.target.value = null; // Clear the file input
    };
    
    const removeDbImageHandler = (imageUrl) => {
        setCurrentImageUrls(prevUrls => prevUrls.filter(url => url !== imageUrl));
        toast.info('Existing image removed. Will be deleted upon update.');
    }
    
    const removeLocalImageHandler = (fileIndex) => {
        URL.revokeObjectURL(imagePreviews[fileIndex]); 
        setImagesFilesToAdd(prevFiles => prevFiles.filter((_, index) => index !== fileIndex));
        setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== fileIndex));
        toast.info('New image removed.');
    };

    const submitHandler = (e) => {
        e.preventDefault();
        
        const totalImages = currentImageUrls.length + imagesFilesToAdd.length;
        if (totalImages === 0) {
            toast.error('Product must have at least one image.');
            return;
        }

        const formData = new FormData();
        
        formData.append('_id', productId);
        formData.append('name', name);
        formData.append('price', price);
        formData.append('brand', brand);
        formData.append('category', category);
        formData.append('countInStock', countInStock);
        formData.append('description', description);
        
        // Send existing image URLs to the backend
        formData.append('currentImages', JSON.stringify(currentImageUrls));
        
        // Send new files to the backend (field name 'newImages' used to distinguish from 'currentImages')
        imagesFilesToAdd.forEach(file => {
            formData.append('newImages', file); 
        });
        
        const specs = { processor, ram, storage, display, camera, battery, os, color, graphicsCard };
        const isSpecsEmpty = Object.values(specs).every(val => val === '');
        if (!isSpecsEmpty) {
            formData.append('specs', JSON.stringify(specs));
        }
        
        dispatch(updateProduct(formData)); 
    };

    const isDisabled = loadingUpdate || loadingDetails; 
    
    // --- Component JSX (Using CreateProductPage Layout) ---
    return (
        <div className="p-4 md:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <Link to='/admin/products' className="text-lime-600 hover:text-lime-500 font-semibold mb-6 inline-flex items-center transition duration-150">
                <FaArrowLeft className='mr-2' /> Go Back
            </Link>

            <h1 className='text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center mt-4'>
                <FaEdit className='mr-3 text-lime-600' /> Edit Product
            </h1>

            {errorDetails && <Message variant='danger'>{errorDetails}</Message>}
            {errorUpdate && <Message variant='danger'>{typeof errorUpdate === 'string' ? errorUpdate : 'Product update failed.'}</Message>}

            {(loadingUpdate || loadingDetails) ? <Spinner /> : errorDetails ? null : (
                <form onSubmit={submitHandler} className="space-y-6">
                    
                    {/* Row 1: Name & Price */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input id="name" type="text" placeholder='Enter product name' value={name} onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                            <input id="price" type="number" placeholder='Enter price' value={price} onChange={(e) => setPrice(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" min="0" required />
                        </div>
                    </div>

                    {/* Row 2: Images & Brand (Layout from CreatePage, but using EditPage logic) */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        
                        {/* Image Upload/Preview - Using EditPage logic (currentImageUrls, imagesFilesToAdd) */}
                        <div>
                            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Product Images (Max {MAX_IMAGES})
                            </label>
                            <div className="flex items-center mt-1">
                                <input 
                                    id="imageFile" 
                                    type="file" 
                                    onChange={selectFileHandler}
                                    className="hidden" 
                                    accept="image/*"
                                    multiple
                                    disabled={currentImageUrls.length + imagesFilesToAdd.length >= MAX_IMAGES} 
                                />
                                <label htmlFor="imageFile" className={`cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition duration-150 ${currentImageUrls.length + imagesFilesToAdd.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <FaCloudUploadAlt className='mr-2' /> Select Image(s)
                                </label>
                            </div>
                            
                            {(currentImageUrls.length > 0 || imagePreviews.length > 0) && (
                                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Images ({currentImageUrls.length + imagePreviews.length}):</p>
                                    <div className="flex flex-wrap gap-3">
                                        {/* Existing Images (from DB) */}
                                        {currentImageUrls.map((url, index) => (
                                            <div key={`db-${index}`} className="relative w-20 h-20 border-2 border-green-500 rounded-lg overflow-hidden shadow-md" title="Existing Image">
                                                <img src={url} alt={`Existing Image ${index + 1}`} className="w-full h-full object-cover" /> 
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeDbImageHandler(url)}
                                                    className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-bl-lg transition duration-150"
                                                >
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        {/* New Image Previews */}
                                        {imagePreviews.map((url, index) => (
                                            <div key={`new-${index}`} className="relative w-20 h-20 border-2 border-blue-500 rounded-lg overflow-hidden shadow-md" title="New Image">
                                                <img src={url} alt={`New Image ${index + 1}`} className="w-full h-full object-cover" /> 
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeLocalImageHandler(index)}
                                                    className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-bl-lg transition duration-150"
                                                >
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {currentImageUrls.length + imagesFilesToAdd.length >= MAX_IMAGES && (
                                <p className='text-sm text-yellow-600 mt-2'>Maximum {MAX_IMAGES} images selected.</p>
                            )}
                        </div>
                        
                        {/* Brand Input */}
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                            <input id="brand" type="text" placeholder='Enter brand' value={brand} onChange={(e) => setBrand(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                    </div>
                    
                    {/* Row 3: Category & Count In Stock */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <input id="category" type="text" placeholder='e.g., smartphones, laptops, accessories' value={category} onChange={(e) => setCategory(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Count In Stock</label>
                            <input id="countInStock" type="number" placeholder='Enter stock count' value={countInStock} onChange={(e) => setCountInStock(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" min="0" required />
                        </div>
                    </div>

                    {/* Specifications Section */}
                    <h2 className='text-xl font-semibold text-gray-800 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700'>
                        Specifications (Optional)
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        
                        {/* Row 1 Specs (3 Columns) */}
                        <div>
                            <label htmlFor="processor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Processor</label>
                            <input id="processor" type="text" placeholder='e.g., Snapdragon 8 Gen 5' value={processor} onChange={(e) => setProcessor(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="ram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">RAM</label>
                            <input id="ram" type="text" placeholder='e.g., 16GB LPDDR5X' value={ram} onChange={(e) => setRam(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="storage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Storage</label>
                            <input id="storage" type="text" placeholder='e.g., 512GB UFS 4.1' value={storage} onChange={(e) => setStorage(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>

                        {/* Row 2 Specs (3 Columns) */}
                        <div>
                            <label htmlFor="display" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display</label>
                            <input id="display" type="text" placeholder='e.g., 6.78-inch AMOLED 165Hz' value={display} onChange={(e) => setDisplay(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="camera" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Camera</label>
                            <input id="camera" type="text" placeholder='e.g., Triple 50MP, DetailMax Engine' value={camera} onChange={(e) => setCamera(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="battery" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Battery</label>
                            <input id="battery" type="text" placeholder='e.g., 7000 mAh (Glacier Battery)' value={battery} onChange={(e) => setBattery(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>

                        {/* Row 3 Specs (3 Columns) */}
                        <div>
                            <label htmlFor="os" className="block text-sm font-medium text-gray-700 dark:text-gray-300">OS</label>
                            <input id="os" type="text" placeholder='e.g., Android 15' value={os} onChange={(e) => setOs(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                            <input id="color" type="text" placeholder='e.g., Sand Storm, Black' value={color} onChange={(e) => setColor(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="graphicsCard" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Graphics Card</label>
                            <input id="graphicsCard" type="text" placeholder='(Optional, for laptops)' value={graphicsCard} onChange={(e) => setGraphicsCard(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>
                    
                    {/* Description - Single Column (Full Width) */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea id="description" placeholder='Enter detailed product description' value={description} onChange={(e) => setDescription(e.target.value)} rows="4"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDisabled}
                    >
                        {loadingUpdate ? 'Updating...' : 'Update Product'}
                    </button>
                    
                </form>
            )}
        </div>
    );
};

export default EditProductPage;