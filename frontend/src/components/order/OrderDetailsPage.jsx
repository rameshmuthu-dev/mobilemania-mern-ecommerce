// src/pages/order/OrderDetailsPage.jsx


import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


// Import your components and Redux action
import OrderDetailsModal from '../pages/OrderDetailsModal'
import { getOrderDetails } from '../../redux/slices/orderSlice'
import Spinner from '../ui/Spinner'


const OrderDetailsPage = () => {
    // Get the orderId from the URL params
    const { orderId } = useParams(); 
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Select relevant state from Redux
    const { orderDetails, isLoading, isError, message } = useSelector((state) => state.order);


    // 1. Effect to fetch order details when the component loads or orderId changes
    useEffect(() => {
        if (orderId) {
            // Dispatch the action to fetch the single order details by ID
            dispatch(getOrderDetails(orderId)); 
        }
    }, [dispatch, orderId]);
    
    // 2. Handler to close the modal and navigate away (e.g., to the Home page)
    const handleCloseModal = () => {
        navigate('/'); 
    };


    // 3. Handle Missing ID
    if (!orderId) {
        return <div className="text-center py-20 text-red-500 font-bold">Error: Order ID Missing</div>;
    }


    // 4. Handle Loading State (initial fetch)
    // We check if orderDetails is not yet present in the state to show a full-screen spinner
    if (isLoading && !orderDetails) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <Spinner />
                <span className="ml-3 text-gray-600">Loading Order Details...</span>
            </div>
        ); 
    }
    
    // 5. Handle Error State
    if (isError) {
         return (
            <div className="text-center py-10">
                <h2 className="text-2xl text-red-600 font-bold">Error Loading Order</h2>
                <p className="text-gray-600">{message || 'Could not fetch order details from server.'}</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="mt-4 text-lime-600 hover:underline"
                >
                    Return to Home
                </button>
            </div>
         );
    }
    
    // 6. Render the Modal (will use the data populated in Redux state)
    // We set isOpen={true} because this component is dedicated to showing the details on a full page.
    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
            <OrderDetailsModal 
                isOpen={true} 
                onClose={handleCloseModal} // Closes the modal and navigates home
                orderId={orderId} 
                // The Modal itself reads the detailed data from the Redux state.
            />
        </main>
    );
};


export default OrderDetailsPage;