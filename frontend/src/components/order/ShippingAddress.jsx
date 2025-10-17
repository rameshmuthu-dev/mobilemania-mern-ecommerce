import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { saveShippingAddress } from '../../redux/slices/orderSlice';

// UI Components (Using standard imports, assuming you have these)
import Button from '../ui/Button';
import Message from '../ui/Message'
import CheckoutSteps from '../ui/CheckoutSteps'
import { FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';

const ShippingAddress = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // REDUX STATE
    const { userInfo } = useSelector((state) => state.auth);
    const { shippingAddress, checkoutDetails } = useSelector((state) => state.order);

    // ✅ CRITICAL FIX: Check if there are items to order (for Buy Now flow)
    const hasOrderItems = checkoutDetails?.orderItems?.length > 0;

    // Local States
    const [name, setName] = useState(shippingAddress?.name || '');
    const [email, setEmail] = useState(shippingAddress?.email || userInfo?.email || '');
    const [mobileNumber, setMobileNumber] = useState(shippingAddress?.mobileNumber || '');
    const [address, setAddress] = useState(shippingAddress?.address || '');
    const [city, setCity] = useState(shippingAddress?.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
    const [country, setCountry] = useState(shippingAddress?.country || 'India');
    
    // UI States
    const [isFormVisible, setIsFormVisible] = useState(!shippingAddress);
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState(null);

    // 1. Initial check: If no items, redirect immediately.
    useEffect(() => {
        if (!hasOrderItems) {
            // console.log("ERROR: No order items found, redirecting.");
            toast.error("Order details missing. Please restart the checkout process.");
            navigate('/');
        }
    }, [hasOrderItems, navigate]);


    // Handlers for Saved Address Actions
    const handleEditAddress = () => {
        setIsFormVisible(true);
    };

    const hasSavedAddress = shippingAddress && shippingAddress.address; 
    
    /**
     * 🟢 FIX POINT: Use this Address & Proceed Button Handler
     * Ensures order items are present and navigates without page refresh.
     */
    const handleUseAddress = () => {
        setGlobalError(null);
        
        if (!hasOrderItems) {
            setGlobalError("Order details are missing. Please restart the checkout process.");
            return;
        }

        if (hasSavedAddress) {
            // console.log("Navigating via Use Address button. Address exists.");
            navigate('/paymentmethod'); // 🔑 SUCCESSFUL NAVIGATION
        } else {
            setGlobalError("Please save a valid shipping address before proceeding to payment.");
        }
    };
    
    
    /**
     * 🟢 FIX POINT: Form Submission Handler (Save Address and Continue)
     * e.preventDefault() is critical to stop the refresh.
     */
    const submitHandler = (e) => {
        e.preventDefault(); // 🛑 முக்கியம்: Page Refresh ஆவதை தடுக்கும்
        setGlobalError(null);
        const newErrors = {};

        // 1. Validation 
        if (!name) newErrors.name = 'Name is required.';
        if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) newErrors.mobileNumber = 'Valid 10-digit mobile number is required.';
        if (!address) newErrors.address = 'Address line is required.';
        if (!city) newErrors.city = 'City is required.';
        if (!postalCode) newErrors.postalCode = 'Postal Code is required.';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setGlobalError('Please fix the errors shown below before saving the address.');
            return;
        }
        
        // 2. Final Check for Order Items (Safety check)
        if (!hasOrderItems) {
             setGlobalError("Order details are missing. Please restart the checkout process.");
             toast.error("Order items are missing.");
             setIsFormVisible(false);
             return;
        }

        // 3. Dispatch and Navigate
        const shippingDetails = { 
            name, email, mobileNumber, address, city, postalCode, country 
        };
        
        dispatch(saveShippingAddress(shippingDetails));
        setIsFormVisible(false);
        
        // console.log("Address saved successfully. Navigating via Submit button.");
        navigate('/paymentmethod'); // 🔑 SUCCESSFUL NAVIGATION
    };

    // UI Rendering
    return (
        // 👇 Replaced FormContainer with simple centering div
        <div className="flex justify-center py-8">
            <div className="w-full max-w-lg p-4"> 
                
                <CheckoutSteps step1 step2 />

                <h1 className="text-3xl font-bold mb-6 text-gray-800">Shipping Address</h1>
                
                {globalError && <Message variant="danger" className="mb-4">{globalError}</Message>}

                {/* Display Saved Address */}
                {hasSavedAddress && !isFormVisible && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-2 border-lime-500">
                        <h3 className="text-xl font-semibold mb-3 flex items-center text-lime-700">
                            <FaMapMarkerAlt className="mr-3" /> Delivery Address
                        </h3>
                        <p className="font-bold">{shippingAddress.name} ({shippingAddress.mobileNumber})</p>
                        <p>{shippingAddress.address}, {shippingAddress.city} - {shippingAddress.postalCode}</p>
                        <p>{shippingAddress.country}</p>
                        
                        <div className="mt-4 flex space-x-3">
                            <Button 
                                onClick={handleUseAddress} 
                                variant="success"
                                className="text-lg px-6 py-2 bg-lime-500 hover:bg-lime-600"
                                type="button" 
                            >
                                Use this Address & Proceed
                            </Button>
                            <Button 
                                onClick={handleEditAddress} 
                                variant="secondary"
                                className="px-4 py-2"
                                type="button"
                            >
                                <FaPencilAlt className="mr-2" /> Edit
                            </Button>
                        </div>
                    </div>
                )}

                {/* Address Form (Visible if no address saved or editing) */}
                {isFormVisible && (
                    <form onSubmit={submitHandler} className="bg-white p-6 rounded-lg shadow-lg">
                        {/* Name */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="Enter your full name"
                            />
                            {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="Enter your email"
                                readOnly={!!userInfo?.email}
                            />
                            {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
                        </div>

                        {/* Mobile Number */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="mobileNumber">Mobile Number</label>
                            <input
                                type="text"
                                id="mobileNumber"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.mobileNumber ? 'border-red-500' : ''}`}
                                placeholder="Enter 10 digit mobile number"
                            />
                            {errors.mobileNumber && <p className="text-red-500 text-xs italic mt-1">{errors.mobileNumber}</p>}
                        </div>
                        
                        {/* Address */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.address ? 'border-red-500' : ''}`}
                                placeholder="Enter full address (Flat/House No, Street, Landmark)"
                            />
                            {errors.address && <p className="text-red-500 text-xs italic mt-1">{errors.address}</p>}
                        </div>

                        {/* City */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="city">City</label>
                            <input
                                type="text"
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.city ? 'border-red-500' : ''}`}
                                placeholder="Enter City"
                            />
                            {errors.city && <p className="text-red-500 text-xs italic mt-1">{errors.city}</p>}
                        </div>

                        {/* Postal Code */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="postalCode">Postal Code</label>
                            <input
                                type="text"
                                id="postalCode"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.postalCode ? 'border-red-500' : ''}`}
                                placeholder="Enter Postal Code"
                            />
                            {errors.postalCode && <p className="text-red-500 text-xs italic mt-1">{errors.postalCode}</p>}
                        </div>

                        {/* Country */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="country">Country</label>
                            <select
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                            </select>
                        </div>

                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-full text-xl"
                        >
                            Save Address and Continue
                        </Button>
                    </form>
                )}
                
                {/* If an address is saved but form is hidden, offer the option to add a new one */}
                {hasSavedAddress && !isFormVisible && (
                    <div className="mt-4 text-center">
                        <button 
                            onClick={() => setIsFormVisible(true)} 
                            className="text-blue-500 hover:text-blue-700 text-sm underline"
                        >
                            Add a New Address
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingAddress;