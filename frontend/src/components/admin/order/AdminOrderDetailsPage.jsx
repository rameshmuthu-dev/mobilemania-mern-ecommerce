import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaTruck } from 'react-icons/fa';

import Spinner from '../../ui/Spinner';
import Message from '../../ui/Message';
import Button from '../../ui/Button';

import { 
    getOrderDetails, 
    updateOrderToDelivered, 
    resetOrderDetails,
    updateOrderToPaid 
} from '../../../redux/slices/adminOrderSlice';

const AdminOrderDetailsPage = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { 
        order: orderDetails, 
        isLoading, 
        isError, 
        message 
    } = useSelector((state) => state.adminOrders);

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }

        dispatch(getOrderDetails(orderId));

        return () => {
            dispatch(resetOrderDetails());
        };
    }, [dispatch, navigate, user, orderId]);

    const TAX_RATE = 0.18; 

    const calculatedItemsPrice = orderDetails?.orderItems?.reduce(
        (acc, item) => acc + (item.price * item.qty), 
        0
    ) ?? 0;

    const finalItemsPrice = orderDetails?.itemsPrice != null 
        ? orderDetails.itemsPrice 
        : calculatedItemsPrice;

    const calculatedShippingPrice = finalItemsPrice > 10000 ? 0 : 50; 

    const finalShippingPrice = orderDetails?.shippingPrice != null 
        ? orderDetails.shippingPrice 
        : calculatedShippingPrice;

    const calculatedTaxPrice = finalItemsPrice * TAX_RATE;

    const taxPrice = orderDetails?.taxPrice != null 
        ? orderDetails.taxPrice 
        : calculatedTaxPrice;

    const calculatedTotalPrice = finalItemsPrice + finalShippingPrice + taxPrice;

    const finalTotalPrice = orderDetails?.totalPrice != null 
        ? orderDetails.totalPrice 
        : calculatedTotalPrice;

    const paidHandler = () => {
        if (window.confirm('Are you sure you want to mark this order as Paid?')) {
            dispatch(updateOrderToPaid(orderId))
                .unwrap()
                .then(() => {
                    toast.success('Order marked as Paid successfully!');
                    dispatch(getOrderDetails(orderId)); 
                })
                .catch((error) => {
                    const errorMessage = error.message || 'Failed to update payment status.';
                    toast.error(errorMessage); 
                });
        }
    };

    const deliverHandler = () => {
        if (window.confirm('Are you sure you want to mark this order as Delivered?')) {
            dispatch(updateOrderToDelivered(orderId))
                .unwrap()
                .then(() => {
                    toast.success('Order marked as Delivered successfully!');
                    dispatch(getOrderDetails(orderId)); 
                })
                .catch((error) => {
                    const errorMessage = error.message || 'Failed to update delivery status.';
                    toast.error(errorMessage); 
                });
        }
    };
    
    if (isLoading) {
        return <Spinner />;
    }

    if (isError) {
        return <Message variant="danger">{message}</Message>;
    }
    
    if (!orderDetails || Object.keys(orderDetails).length === 0) {
        return <Message variant="info">Order details not found.</Message>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <h1 className='text-3xl font-bold text-gray-800 mb-6'>
                Order Details: {orderDetails._id}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-green-700 mb-4">Shipping & User</h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>Name:</strong> {orderDetails.user?.firstName} {orderDetails.user?.lastName}</p>
                            <p><strong>Email:</strong> <a href={`mailto:${orderDetails.user?.email}`} className="text-blue-500 hover:underline">{orderDetails.user?.email}</a></p>
                            <p>
                                <strong>Address:</strong> {orderDetails.shippingAddress?.address}, {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.postalCode}, {orderDetails.shippingAddress?.country}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-green-700 mb-4">Order Items</h2>
                        <ul className="divide-y divide-gray-200">
                            {orderDetails.orderItems?.map((item) => (
                                <li key={item.product} className="py-4 flex justify-between items-center">
                                    <span className="text-gray-900 font-medium">{item.name}</span>
                                    <span className="text-gray-600">
                                        {item.qty} x ₹{item.price?.toFixed(2) || '0.00'} = ₹{(item.qty * item.price)?.toFixed(2) || '0.00'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-3">Payment Status</h2>
                        <p className="text-gray-700 mb-4">
                            <strong>Method:</strong> {orderDetails.paymentMethod || 'N/A'}
                        </p>
                        <div className={`p-3 rounded-md text-center text-white ${orderDetails.isPaid ? 'bg-green-500' : 'bg-red-500'}`}>
                            {orderDetails.isPaid ? (
                                <p><FaCheck className="inline mr-2" /> Paid on {new Date(orderDetails.paidAt).toLocaleDateString('en-US')}</p>
                            ) : (
                                <p><FaTimes className="inline mr-2" /> Payment Pending</p>
                            )}
                        </div>
                        
                        {!orderDetails.isPaid && (
                             <Button 
                                onClick={paidHandler}
                                variant="success" 
                                className='w-full mt-4 py-2'
                                disabled={isLoading}
                            >
                                Mark as Paid
                            </Button>
                        )}
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-3">Delivery Status</h2>
                        <div className={`p-3 rounded-md text-center text-white ${orderDetails.isDelivered ? 'bg-green-500' : 'bg-yellow-500'}`}>
                            {orderDetails.isDelivered ? (
                                <p><FaCheck className="inline mr-2" /> Delivered on {new Date(orderDetails.deliveredAt).toLocaleDateString('en-US')}</p>
                            ) : (
                                <p><FaTruck className="inline mr-2" /> Delivery Pending</p>
                            )}
                        </div>
                        
                        {!orderDetails.isDelivered && orderDetails.isPaid && (
                             <Button 
                                variant="success" 
                                className='w-full mt-4 py-2 flex items-center justify-center'
                                onClick={deliverHandler}
                                disabled={isLoading}
                            >
                                <FaTruck className='mr-2' /> Mark as Delivered
                            </Button>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-green-700 mb-4">Order Summary</h2>
                        <div className="space-y-2 text-gray-700">
                            <div className="flex justify-between">
                                <span>Items Price:</span>
                                <span>₹{finalItemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>₹{finalShippingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>Tax (GST):</span>
                                <span>₹{taxPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2">
                                <span>Order Total:</span>
                                <span>₹{finalTotalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailsPage;