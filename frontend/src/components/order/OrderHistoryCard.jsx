// src/components/order/OrderHistoryCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaShippingFast, FaCheckCircle, FaRupeeSign, FaTimesCircle } from 'react-icons/fa';
import Button from '../ui/Button'; // Assuming ui/Button is available

/**
 * Component to display a summary card for a single past order.
 * @param {object} order - The order object from the orderSlice state.
 */
const OrderHistoryCard = ({ order }) => {
    // Determine the status text and color based on order state
    const isPaid = order.isPaid;
    const isDelivered = order.isDelivered;

    const statusIcon = isDelivered ? FaCheckCircle : FaShippingFast;
    const statusColor = isDelivered ? 'text-green-600' : 'text-yellow-600';
    const statusText = isDelivered ? 'Delivered' : order.isPaid ? 'Shipped/Processing' : 'Awaiting Payment';

    // Get the date string
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    // Calculate total items
    const totalItems = order.orderItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 mb-6">
            <div className="flex justify-between items-start mb-4 border-b pb-3">

                {/* Order ID and Date */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Order ID: {order._id}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                        <FaCalendarAlt className="mr-2" /> Placed on: {orderDate}
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-end">
                    <span className={`text-lg font-bold flex items-center ${statusColor}`}>
                        <statusIcon className="mr-2" /> {statusText}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                        Payment: {isPaid ? <span className="text-green-600 font-semibold">Paid</span> : <span className="text-red-600 font-semibold">Pending</span>}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                {/* Items Summary */}
                <div className="text-gray-700">
                    <p className="font-semibold">Items:</p>
                    <p className="text-sm">{totalItems} Total Item{totalItems !== 1 && 's'}</p>
                    <p className="text-sm italic text-gray-500">{order.orderItems[0].name} {totalItems > 1 && ` and ${totalItems - 1} more`}</p>
                </div>

                {/* Shipping Address (Simplified) */}
                <div className="text-gray-700">
                    <p className="font-semibold">Ship To:</p>
                    <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                    <p className="text-sm italic text-gray-500">{order.shippingAddress.postalCode}</p>
                </div>

                {/* Order Total */}
                <div className="text-gray-700 text-right">
                    <p className="font-semibold">Order Total:</p>
                    <p className="text-xl font-extrabold text-indigo-600 flex items-center justify-end">
                        <FaRupeeSign size={15} className="mr-1" />{order.totalPrice.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* View Details Button */}
            <div className="pt-4 border-t mt-4 text-right">
                <Link to={`/order/${order._id}`}>
                    <Button variant="outline" className="text-sm py-2 px-4">
                        View Details
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default OrderHistoryCard;