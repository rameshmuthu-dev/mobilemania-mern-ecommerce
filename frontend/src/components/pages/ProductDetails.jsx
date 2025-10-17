import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaArrowLeft, FaBolt } from 'react-icons/fa';

import Spinner from '../ui/Spinner';
import Message from '../ui/Message';
import Button from '../ui/Button';
import ProductReviews from '../ui/ProductReviews'
import WishlistButton from '../ui/WishlistButton';
import SimilarProducts from '../product/SimilarProducts';

import { getProductDetails } from '../../redux/slices/productSlice'
import { updateCartItem } from '../../redux/slices/cartSlice'
import { setCheckoutDetails } from '../../redux/slices/orderSlice'

const Rating = ({ value, text }) => {
    const starArray = Array.from({ length: 5 }, (_, index) => {
        const full = index + 1 <= value;
        const half = index + 0.5 === value;
        return (
            <span key={index} className={full ? 'text-yellow-500' : 'text-gray-300'}>
                {full || half ? '★' : '☆'}
            </span>
        );
    });
    return (
        <div className="flex items-center text-sm">
            {starArray}
            <span className="text-gray-600 ml-2 text-sm">({text})</span>
        </div>
    );
};

const ProductDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: productId } = useParams();

    const productState = useSelector((state) => state.products || {});

    const {
        productDetails,
        loading: isLoading,
        error: isError,
        message
    } = productState;

    const localUser = localStorage.getItem('user');
    const userInfo = localUser ? JSON.parse(localUser) : null;
    
    // Check if the current user is an admin
    const isAdmin = userInfo && userInfo.isAdmin;

    const [selectedImage, setSelectedImage] = useState('');
    const [qty, setQty] = useState(1);
    const [mergedProduct, setMergedProduct] = useState(null);

    useEffect(() => {
        if (productId) {
            dispatch(getProductDetails(productId));
        }
    }, [dispatch, productId]);

    useEffect(() => {
        if (productDetails) {
            
            const specs = productDetails.specs || {};

            const finalProduct = {
                ...productDetails,
                ...specs,
            };
            
            setMergedProduct(finalProduct);
            
            if (productDetails.images && productDetails.images.length > 0) {
                setSelectedImage(productDetails.images[0]);
            }
        }
    }, [productDetails]);

    const addToCartHandler = () => {
        dispatch(updateCartItem({ productId, qty }));
        navigate('/cart');
    };

    const buyNowHandler = () => {
        const product = mergedProduct;
        if (!product || qty === 0) return;

        if (!userInfo) {
            navigate(`/login?redirect=/shipping`);
            return;
        }
        
        const itemToBuy = {
            product: productId,
            name: product.name,
            image: product.images[0],
            price: product.price,
            qty: qty,
        };
        
        const calculatedItemsPrice = (itemToBuy.price * itemToBuy.qty);
        const shippingPrice = (10).toFixed(2);
        const taxRate = 0.18;
        const taxPrice = (calculatedItemsPrice * taxRate).toFixed(2);
        
        const itemsPrice = calculatedItemsPrice.toFixed(2);
        const totalPrice = (parseFloat(itemsPrice) + parseFloat(shippingPrice) + parseFloat(taxPrice)).toFixed(2);

        dispatch(setCheckoutDetails({
            orderItems: [itemToBuy],
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        }));
        
        navigate('/shipping');
    };

    const product = mergedProduct;

    if (!product) {
        return isLoading ? <Spinner /> : isError ? <Message variant="danger">{message}</Message> : null;
    }
    
    const imageSource = selectedImage || '/images/no-image.png';

    return (
        <main className="container mx-auto px-4 py-8">
            <Link to="/" className="text-lime-600 hover:text-lime-800 flex items-center mb-6 font-medium">
                <FaArrowLeft className="mr-2" /> Back to Products
            </Link>

            <section className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    <figure className="md:col-span-1">
                        <img 
                            src={imageSource} 
                            alt={product.name} 
                            className="w-full h-auto rounded-lg shadow-lg object-contain mb-4 border border-gray-200"
                            style={{ maxHeight: '450px' }} 
                        />
                        {product.images && product.images.length > 1 && (
                            <div className="flex space-x-3 overflow-x-auto p-1">
                                {product.images.map((imgUrl, index) => (
                                    <img 
                                        key={index}
                                        src={imgUrl}
                                        alt={`${product.name} image ${index + 1}`}
                                        onClick={() => setSelectedImage(imgUrl)}
                                        className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${
                                            imgUrl === selectedImage ? 'border-lime-500 shadow-md' : 'border-gray-200 hover:border-lime-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </figure>
                    
                    <article className="md:col-span-1 p-4">
                        <h1 className="text-4xl font-extrabold mb-3 text-gray-900">{product.name}</h1>
                        <div className="mb-4">
                            <Rating value={product.rating || 0} text={`${product.numReviews || 0} reviews`} />
                        </div>
                        
                        <p className="text-gray-700 mb-6 text-xl">
                            Price: 
                            <span className="text-4xl font-extrabold text-lime-600 ml-2">
                                ₹{product.price.toLocaleString('en-IN')}
                            </span>
                        </p>
                        
                        <h2 className="text-xl font-semibold mt-4 mb-2">About this Product:</h2>
                        <p className="text-gray-600 leading-relaxed border-b pb-4 mb-6">
                            {product.description}
                        </p>
                        
                        {/* HIDES Cart/Wishlist/BuyNow Section for Admin */}
                        {!isAdmin && (
                            <aside className="bg-gray-50 p-5 rounded-xl shadow-inner border border-gray-200">
                                <div className="flex justify-between items-center border-b pb-3 mb-3">
                                    <span className="text-lg font-semibold">Status:</span>
                                    <span 
                                        className={`font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {product.countInStock > 0 ? `In Stock (${product.countInStock} units)` : 'Out of Stock'}
                                    </span>
                                </div>

                                {product.countInStock > 0 && (
                                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                                        <span className="text-lg font-semibold">Quantity:</span>
                                        <select 
                                            value={qty} 
                                            onChange={(e) => setQty(Number(e.target.value))}
                                            className="p-2 border rounded-lg focus:ring-lime-500 focus:border-lime-500"
                                        >
                                            {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                                                <option key={x + 1} value={x + 1}>
                                                    {x + 1}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                <div className="mb-3">
                                    <WishlistButton product={product} isDetailPage={true} />
                                </div>
                                
                                <Button
                                    onClick={addToCartHandler} 
                                    disabled={product.countInStock === 0}
                                    variant="gradient" 
                                    className="w-full mt-4 flex items-center justify-center text-xl"
                                >
                                    <FaShoppingCart className="mr-3" /> Add To Cart
                                </Button>

                                <Button
                                    onClick={buyNowHandler} 
                                    disabled={product.countInStock === 0}
                                    variant="success" 
                                    className="w-full mt-3 flex items-center justify-center text-xl bg-yellow-500 hover:bg-yellow-600 border-yellow-700 text-gray-900 font-extrabold"
                                >
                                    <FaBolt className="mr-3" /> Buy Now
                                </Button>
                            </aside>
                        )}
                    </article> 
                    
                </div>
            </section>
                

            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
                    
                    <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-200 lg:pr-10 pb-6 lg:pb-0"> 
                        <h2 className="text-3xl font-bold mb-5 border-b-2 pb-2 text-lime-600">Detailed Specifications</h2> 
                        
                        <div className="text-gray-700"> 
                            <ul className="space-y-2"> 
                                {product.category && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">Category:</span> <span className="text-right">{product.category}</span>
                                    </li>
                                )}
                                {product.subcategory && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">Subcategory:</span> <span className="text-right">{product.subcategory}</span>
                                    </li>
                                )}
                                
                                {product.brand && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">Brand:</span> <span className="text-right">{product.brand}</span>
                                    </li>
                                )}
                                {product.processor && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">Processor:</span> <span className="text-right">{product.processor}</span>
                                    </li>
                                )}
                                {product.ram && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">RAM:</span> <span className="text-right">{product.ram}</span>
                                    </li>
                                )}
                                {product.storage && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">Storage:</span> <span className="text-right">{product.storage}</span>
                                    </li>
                                )}
                                {product.display && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">Display:</span> <span className="text-right">{product.display}</span>
                                    </li>
                                )}
                                {product.battery && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">Battery:</span> <span className="text-right">{product.battery}</span>
                                    </li>
                                )}
                                {product.graphicsCard && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">Graphics Card:</span> <span className="text-right">{product.graphicsCard}</span>
                                    </li>
                                )}
                                {product.os && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">OS:</span> <span className="text-right">{product.os}</span>
                                    </li>
                                )}
                                {product.color && (
                                    <li className="flex justify-between border-b border-dashed pb-1">
                                        <span className="font-medium text-gray-800">Color:</span> <span className="text-right">{product.color}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* ProductReviews (REVIEWS ARE VISIBLE TO ADMIN) */}
                    <article className="lg:col-span-1">
                        {/* We need to pass the isAdmin prop to ProductReviews 
                            to control the visibility of the Review Form INSIDE that component. */}
                        <ProductReviews productId={productId} isAdmin={isAdmin} /> 
                    </article>

                </div>
            </section>
            
            {product && product.category && (
                <section className="mt-12">
                    <SimilarProducts currentProductId={productId} />
                </section>
            )}

        </main>
    );
};

export default ProductDetails;