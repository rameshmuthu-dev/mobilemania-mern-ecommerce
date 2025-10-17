import React from 'react';
import { useSelector } from 'react-redux';
import { FaTimes, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const OrderDetailsModal = ({ isOpen, onClose, orderId }) => {
    const { orderDetails, isLoading, message, isError } = useSelector((state) => state.order);

    if (!isOpen) return null;

    const isDataValid = orderDetails && orderDetails._id === orderId;

    let finalItemsPrice = 0;
    let finalShippingPrice = 0;
    let finalTotalPrice = 0;
    const TAX_RATE = 0.18;

    if (isDataValid) {
        const calculatedItemsPrice = orderDetails.orderItems.reduce(
            (acc, item) => acc + item.price * item.qty,
            0
        );

        const calculatedShippingPrice = calculatedItemsPrice > 10000 ? 0 : 50;

        finalItemsPrice = orderDetails.itemsPrice ?? calculatedItemsPrice;
        finalShippingPrice = orderDetails.shippingPrice ?? calculatedShippingPrice;
        const taxPrice = orderDetails.taxPrice ?? (finalItemsPrice * TAX_RATE); 
        
        finalTotalPrice = orderDetails.totalPrice ?? (finalItemsPrice + finalShippingPrice + taxPrice);
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100/0 backdrop-blur-sm flex items-center justify-center p-4">
            
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                
                <div className="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-800">
                        Order Details: <span className='text-lime-600 font-extrabold'>#{orderId ? orderId.substring(0, 10) : ''}...</span>
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-red-600 transition p-1"
                        aria-label="Close modal"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-5">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <FaSpinner className="animate-spin text-lime-500 mr-3" size={24} />
                            <span className="text-gray-600 font-medium">Loading order details...</span>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-5 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="text-red-600 font-semibold">Error: Could not load details.</h4>
                            <p className="text-sm text-gray-500">{message}</p>
                        </div>
                    ) : isDataValid ? (
                        <div className="space-y-6">
                            
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                <span className="font-semibold text-gray-700">Order Placed:</span>
                                <span className="text-lime-600 font-bold">{formatDate(orderDetails.createdAt)}</span>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold border-b-2 pb-1 mb-3 text-lime-600">Products ({orderDetails.orderItems.length})</h4>
                                <ul className="space-y-3">
                                    {orderDetails.orderItems.map((item) => (
                                        <li key={item.product} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                            <span className="text-gray-800">
                                                {item.name} 
                                            </span>
                                            <span className="text-gray-600">
                                                Qty: <span className='font-medium'>{item.qty}</span>
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                {formatCurrency(item.price)} each
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold border-b-2 pb-1 mb-3 text-lime-600">
                                    <FaMapMarkerAlt className='inline mr-2 text-base'/>Shipping Address
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.city} - {orderDetails.shippingAddress.postalCode}, {orderDetails.shippingAddress.country}
                                </p>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='p-3 border rounded-lg'>
                                    <h4 className="text-sm font-semibold mb-1 text-gray-600">Payment Status</h4>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                        orderDetails.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {orderDetails.isPaid ? `PAID (${formatDate(orderDetails.paidAt)})` : 'NOT PAID'}
                                    </span>
                                </div>
                                <div className='p-3 border rounded-lg'>
                                    <h4 className="text-sm font-semibold mb-1 text-gray-600">Delivery Status</h4>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                        orderDetails.isDelivered ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {orderDetails.isDelivered ? 'DELIVERED' : 'PENDING'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold border-b-2 pb-1 mb-3 text-lime-600">Pricing Summary</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Items Price:</span>
                                        <span className="font-medium">{formatCurrency(finalItemsPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping Price:</span>
                                        <span className="font-medium">{formatCurrency(finalShippingPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax Price:</span>
                                        <span className="font-medium">{formatCurrency(orderDetails.taxPrice ?? 0)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between border-t border-gray-300 pt-3 mt-3 font-extrabold text-base">
                                        <span>Order Total:</span>
                                        <span className="text-lime-700 text-xl">{formatCurrency(finalTotalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-gray-500">
                            No details available for this order yet.
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-200">
                    <button 
                        onClick={onClose} 
                        className="w-full bg-lime-500 text-white py-2 rounded-lg hover:bg-lime-600 transition font-medium"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;