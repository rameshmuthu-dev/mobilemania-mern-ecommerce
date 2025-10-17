import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyOrders, getOrderDetails } from '../../redux/slices/orderSlice'
import Spinner from '../ui/Spinner'
import Message from '../ui/Message';
import { FaBoxOpen, FaAngleRight, FaEye } from 'react-icons/fa';
import OrderDetailsModal from '../../components/pages/OrderDetailsModal'

const OrderHistoryPage = () => {
    const dispatch = useDispatch();
    
    // State to manage the modal visibility and the ID of the order to display
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    
    // Select state from the Redux order slice
    const { 
        myOrders: fetchedOrders, 
        isLoading, 
        myOrdersError 
    } = useSelector((state) => state.order); 

    const { user } = useSelector((state) => state.auth);

    // Fetch orders when the component mounts
    useEffect(() => {
        dispatch(getMyOrders());
    }, [dispatch]);
    
    // Filter logic: Only show orders where payment was successful (isPaid: true)
    // Ensures 'fetchedOrders' is treated as an empty array if it is null/undefined to prevent crashes.
    const orders = (fetchedOrders || []).filter(order => order.isPaid);
        
    // *** Modal Handlers ***
    const handleViewDetails = (orderId) => {
        setSelectedOrderId(orderId); 
        // Dispatch the thunk to fetch the specific order details for the modal
        dispatch(getOrderDetails(orderId)); 
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrderId(null);
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-[70vh]">
            
            {/* Breadcrumb Navigation */}
            <nav className="text-sm mb-4 flex items-center space-x-2 text-gray-500">
                <Link to="/" className="hover:text-lime-600">Home</Link>
                <FaAngleRight className="w-3 h-3" />
                <span className="text-gray-700 font-medium">My Orders</span>
            </nav>

            {/* Page Title */}
            <h1 className="text-4xl font-extrabold text-gray-800 mb-6 border-b-4 border-lime-500 inline-block pb-1">
                <FaBoxOpen className="inline-block mr-3 text-lime-600" /> 
                My Order History
            </h1>

            {/* Loading/Error State Handling */}
            {isLoading ? (
                <Spinner />
            ) : myOrdersError ? ( 
                <Message variant="danger">
                    Error fetching orders: {myOrdersError}
                </Message>
            ) : orders.length === 0 ? ( 
                // Display message if no paid orders are found
                <div className="text-center py-16 bg-white rounded-lg shadow-lg mt-8">
                    <FaBoxOpen size={60} className="text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Paid Orders Found</h2>
                    <p className="text-gray-500 mb-6">
                        You have no successful transactions yet, {user?.firstName || 'Customer'}.
                    </p>
                    <Link 
                        to="/" 
                        className="bg-lime-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-lime-600 transition"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                // Orders Table (Safe to map as 'orders' is guaranteed to be an array here)
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Paid Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Status</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">View</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* 🎯 மாற்றம்: Desktop View-வில் வரிசையை மாற்றுதல் */}
                                {orders
                                    .slice()      // Copy the array
                                    .reverse()    // Reverse the array (Newest First)
                                    .map((order) => (
                                        <tr key={order._id} className="hover:bg-lime-50/50 transition duration-150">
                                            {/* UX Improvement: Show Product Name */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.orderItems[0].name}
                                                {order.orderItems.length > 1 && (
                                                    <span className="ml-2 text-xs text-gray-500 font-normal">
                                                        (+ {order.orderItems.length - 1} more)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {formatCurrency(order.totalPrice)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                                                    Paid on {formatDate(order.paidAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    order.isDelivered ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.isDelivered ? 'Delivered' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Button to open the modal */}
                                                <button 
                                                    onClick={() => handleViewDetails(order._id)}
                                                    className="text-lime-600 hover:text-lime-800 flex items-center justify-end"
                                                >
                                                    <FaEye className="mr-1" /> View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden divide-y divide-gray-200">
                        {/* 🎯 மாற்றம்: Mobile View-வில் வரிசையை மாற்றுதல் */}
                        {orders
                            .slice()      // Copy the array
                            .reverse()    // Reverse the array (Newest First)
                            .map((order) => (
                                <div key={order._id} className="p-4 hover:bg-lime-50/50 transition duration-150">
                                    <div className="flex justify-between items-start mb-2">
                                        {/* UX Improvement: Show Product Name for mobile */}
                                        <div className="text-sm font-semibold text-gray-900">
                                            {order.orderItems[0].name}
                                            {order.orderItems.length > 1 && (
                                                <span className="ml-2 text-xs text-gray-500 font-normal">
                                                    (+ {order.orderItems.length - 1} more)
                                                </span>
                                            )}
                                        </div>
                                        {/* Button to open the modal */}
                                        <button 
                                            onClick={() => handleViewDetails(order._id)}
                                            className="text-lime-600 hover:text-lime-800 flex items-center text-sm font-medium"
                                        >
                                            <FaEye className="mr-1" /> View
                                        </button>
                                    </div>
                                    
                                    {/* Order details */}
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-gray-600">Total:</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(order.totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="text-gray-700">{formatDate(order.createdAt)}</span>
                                    </div>

                                    {/* Status badges */}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Status:</span>
                                        <div className="flex space-x-2">
                                            <span className={`px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                                                Paid
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs leading-5 font-semibold rounded-full ${
                                                order.isDelivered ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.isDelivered ? 'Delivered' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
            
            {/* Modal Component: Rendered only when isModalOpen is true */}
            {isModalOpen && (
                <OrderDetailsModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    orderId={selectedOrderId} 
                />
            )}
        </div>
    );
};

export default OrderHistoryPage;