import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlusCircle, FaArrowLeft, FaCloudUploadAlt, FaTrash } from 'react-icons/fa';

import Spinner from '../../ui/Spinner'; 
import Message from '../../ui/Message'; 

import { 
    createProduct, 
    clearCreateStatus 
} from '../../../redux/slices/productSlice'; 


const MAX_IMAGES = 5;

const CreateProductPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Assuming your productSlice state structure is correct for creation
    const { 
        isCreating: loadingCreate, 
        createError: errorCreate, 
        createSuccess: successCreate 
    } = useSelector(state => state.products || {}); // Added default empty object for safety
    
    // --- STATE FOR FORM DATA AND FILES ---
    // State to hold the actual File objects (sent to backend)
    const [imagesFiles, setImagesFiles] = useState([]); 
    // State to hold URLs for local preview
    const [imagePreviews, setImagePreviews] = useState([]); 
    
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState(''); 
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    
    // Specs state
    const [processor, setProcessor] = useState('');
    const [ram, setRam] = useState('');
    const [storage, setStorage] = useState('');
    const [display, setDisplay] = useState('');
    const [camera, setCamera] = useState('');
    const [battery, setBattery] = useState('');
    const [os, setOs] = useState('');
    const [color, setColor] = useState('');
    const [graphicsCard, setGraphicsCard] = useState('');
    
    // --- SIDE EFFECTS FOR REDUX STATUS ---
    useEffect(() => {
        if (successCreate) {
            toast.success('Product created successfully!');
            dispatch(clearCreateStatus());
            navigate('/admin/products');
        }
        
        if (errorCreate) {
            // Display the error message returned from the backend/thunk
            const errorMessage = typeof errorCreate === 'string' ? errorCreate : (errorCreate.message || 'Product creation failed.');
            toast.error(errorMessage);
        }
        
        // Cleanup function for local image URLs to prevent memory leaks
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
        
    }, [dispatch, navigate, successCreate, errorCreate, imagePreviews]);
    
    
    // --- HANDLERS ---
    
    const selectFileHandler = (e) => {
        const files = Array.from(e.target.files);
        
        if (imagesFiles.length + files.length > MAX_IMAGES) {
            toast.error(`You can only upload a maximum of ${MAX_IMAGES} images.`);
            return;
        }

        if (!files.length) return;

        // Add new files to the files state
        setImagesFiles(prevFiles => [...prevFiles, ...files]); 
        
        // Create URLs for local preview
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
        
        // Clear the file input
        e.target.value = null; 
    };

    const removeImageHandler = (fileIndex) => {
        // Revoke the URL for the image being removed
        URL.revokeObjectURL(imagePreviews[fileIndex]); 
        
        // Remove the file and preview URL by index
        setImagesFiles(prevFiles => prevFiles.filter((_, index) => index !== fileIndex));
        setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== fileIndex));
        
        toast.info('Image removed from list.');
    };


    // --- COMBINED SUBMIT HANDLER ---
    const submitHandler = (e) => {
        e.preventDefault();
        
        // Basic Form Validation (Add more as needed)
        if (!category || !category.trim()) {
            toast.error('Please enter a Category.');
            return;
        }

        if (imagesFiles.length === 0) {
            toast.error('Please upload at least one image.');
            return;
        }
        
        // 1. Create FormData object
        const formData = new FormData();
        
        // Append all regular fields
        formData.append('name', name);
        formData.append('price', Number(price));
        formData.append('brand', brand);
        formData.append('category', category);
        formData.append('countInStock', Number(countInStock));
        formData.append('description', description);
        
        // 2. Append Images (Field name 'images' must match backend middleware)
        imagesFiles.forEach(file => {
            formData.append('images', file);
        });
        
        // 3. Prepare and append specs (as JSON string, matching the backend controller logic)
        const specs = {
            processor, ram, storage, display, camera, battery, os, color, graphicsCard,
        };
        
        const isSpecsEmpty = Object.values(specs).every(val => val === '');
        if (!isSpecsEmpty) {
            // The backend expects the entire JSON string to be under the field name 'specs'
            formData.append('specs', JSON.stringify(specs));
        }

        // Dispatch the single thunk with the combined FormData
        dispatch(createProduct(formData));
    };

    const isDisabled = loadingCreate; // Disable button when loading
    
    // --- JSX RENDER ---
    return (
        <div className="p-4 md:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            
            <Link to='/admin/products' className="text-lime-600 hover:text-lime-500 font-semibold mb-6 inline-flex items-center transition duration-150">
                <FaArrowLeft className='mr-2' /> Go Back
            </Link>

            <h1 className='text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center mt-4'>
                <FaPlusCircle className='mr-3 text-lime-600' /> Create New Product
            </h1>

            {loadingCreate && <Spinner />}
            {errorCreate && <Message variant='danger'>{typeof errorCreate === 'string' ? errorCreate : 'Product creation failed.'}</Message>}

            {/* Do not add encType="multipart/form-data" to the form element here */}
            <form onSubmit={submitHandler} className="space-y-6">
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input id="name" type="text" placeholder='Enter product name' value={name} onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (Rs.)</label>
                        <input id="price" type="number" placeholder='Enter price' value={price} onChange={(e) => setPrice(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" min="0" required />
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    
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
                                disabled={imagesFiles.length >= MAX_IMAGES} 
                            />
                            <label htmlFor="imageFile" className={`cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition duration-150 ${imagesFiles.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <FaCloudUploadAlt className='mr-2' /> Select Image(s)
                            </label>
                        </div>
                        
                        {imagePreviews.length > 0 && (
                            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Images ({imagePreviews.length}):</p>
                                <div className="flex flex-wrap gap-3">
                                    {imagePreviews.map((url, index) => (
                                        <div key={index} className="relative w-20 h-20 border border-gray-300 rounded-lg overflow-hidden shadow-md">
                                            <img src={url} alt={`Product Image ${index + 1}`} className="w-full h-full object-cover" /> 
                                            <button 
                                                type="button" 
                                                onClick={() => removeImageHandler(index)}
                                                className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-bl-lg transition duration-150"
                                            >
                                                <FaTrash size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {imagesFiles.length >= MAX_IMAGES && (
                            <p className='text-sm text-yellow-600 mt-2'>Maximum {MAX_IMAGES} images selected.</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                        <input id="brand" type="text" placeholder='Enter brand' value={brand} onChange={(e) => setBrand(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                </div>
                
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

                <h2 className='text-xl font-semibold text-gray-800 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700'>
                    Specifications (Optional)
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    
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
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea id="description" placeholder='Enter detailed product description' value={description} onChange={(e) => setDescription(e.target.value)} rows="4"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition duration-150"
                    disabled={isDisabled}
                >
                    {loadingCreate ? 'Creating...' : 'Create Product'}
                </button>
                
            </form>
        </div>
    );
};

export default CreateProductPage;