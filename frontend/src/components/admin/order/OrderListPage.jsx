import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes, FaCheck, FaEdit, FaTruck, FaFilter, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import Message from '../../ui/Message'; 
import Button from '../../ui/Button'; 
import Spinner from '../../ui/Spinner'; 
import Pagination from '../../ui/Pagination'; 

import { 
    getOrders, 
    updateOrderToDelivered, 
    resetAdminOrders,
    deleteOrder
} from '../../../redux/slices/adminOrderSlice'; 

const OrderListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [filterStatus, setFilterStatus] = useState('all'); 
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1); 
    const pageSize = 10; 

    const { 
        orders, 
        isLoading, 
        isError, 
        message,
        page, 
        pages, 
        totalOrders
    } = useSelector((state) => state.adminOrders);

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }
        
        let filterParams = {};

        if (filterStatus === 'paid') {
            filterParams = { isPaid: true };
        } else if (filterStatus === 'notPaid') {
            filterParams = { isPaid: false };
        } else if (filterStatus === 'delivered') {
            filterParams = { isDelivered: true };
        } else if (filterStatus === 'notDelivered') {
            filterParams = { isDelivered: false };
        }
        
        if (paymentMethodFilter) {
            filterParams.paymentMethod = paymentMethodFilter;
        }
        
        filterParams.sortBy = 'newest';
        
        filterParams.pageNumber = currentPage; 
        filterParams.pageSize = pageSize;
        
        dispatch(getOrders(filterParams));

        return () => {
            dispatch(resetAdminOrders());
        };
    }, [dispatch, navigate, user, filterStatus, paymentMethodFilter, currentPage]);

    const deliverHandler = (orderId) => {
        if (window.confirm('Are you sure you want to mark this order as Delivered?')) {
            dispatch(updateOrderToDelivered(orderId))
                .unwrap()
                .then(() => {
                    toast.success('Order marked as Delivered successfully!');
                    dispatch(getOrders({
                        ...(filterStatus === 'paid' && { isPaid: true }),
                        ...(filterStatus === 'notPaid' && { isPaid: false }),
                        ...(filterStatus === 'delivered' && { isDelivered: true }),
                        ...(filterStatus === 'notDelivered' && { isDelivered: false }),
                        ...(paymentMethodFilter && { paymentMethod: paymentMethodFilter }),
                        sortBy: 'newest',
                        pageNumber: currentPage,
                        pageSize: pageSize,      
                    }));
                })
                .catch((error) => {
                    const errorMessage = error.message || 'Failed to update delivery status.';
                    toast.error(errorMessage); 
                });
        }
    };
    
    const deleteHandler = (orderId) => {
        if (window.confirm('Are you sure you want to PERMANENTLY DELETE this order? This cannot be undone.')) {
            dispatch(deleteOrder(orderId))
                .unwrap()
                .then(() => {
                    toast.success('Order deleted successfully!');
                    dispatch(getOrders({
                        ...(filterStatus === 'paid' && { isPaid: true }),
                        ...(filterStatus === 'notPaid' && { isPaid: false }),
                        ...(filterStatus === 'delivered' && { isDelivered: true }),
                        ...(filterStatus === 'notDelivered' && { isDelivered: false }),
                        ...(paymentMethodFilter && { paymentMethod: paymentMethodFilter }),
                        sortBy: 'newest',
                        pageNumber: currentPage,
                        pageSize: pageSize,      
                    }));
                })
                .catch((error) => {
                    const errorMessage = error.message || 'Failed to delete order.';
                    toast.error(errorMessage);
                });
        }
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('en-US') : '';
    };
    
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1); 
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
                <h1 className='text-3xl font-bold text-gray-800 mb-4 sm:mb-0'>Orders ({totalOrders})</h1> 

                <div className='flex flex-wrap gap-4 items-center'> 
                    <div className='flex items-center space-x-2 bg-white border border-gray-300 rounded-md shadow-sm p-1.5'>
                        <FaFilter className='text-gray-500 ml-1' />
                        <select 
                            id="orderFilter"
                            value={filterStatus}
                            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
                            className='p-1 text-sm bg-white border-0 focus:ring-0 focus:border-0 cursor-pointer font-semibold'
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="notPaid">Not Paid</option>
                            <option value="delivered">Delivered</option>
                            <option value="notDelivered">Not Delivered</option>
                        </select>
                    </div>

                    <div className='flex items-center space-x-2 bg-white border border-gray-300 rounded-md shadow-sm p-1.5'>
                        <select 
                            id="paymentMethodFilter"
                            value={paymentMethodFilter}
                            onChange={(e) => handleFilterChange(setPaymentMethodFilter, e.target.value)}
                            className='p-1 text-sm bg-white border-0 focus:ring-0 focus:border-0 cursor-pointer font-semibold'
                        >
                            <option value="">All Methods</option>
                            <option value="Cash on Delivery (COD)">COD</option>
                            <option value="CreditCard">Credit Card</option>
                            <option value="Stripe">Stripe</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Spinner />
            ) : isError ? (
                <Message variant="danger">{message}</Message>
            ) : orders.length === 0 ? (
                <Message variant="info">No orders found matching the criteria.</Message>
            ) : (
                <div className="overflow-x-auto bg-white shadow-xl rounded-lg"> 
                    <table className="divide-y divide-gray-200 w-full"> 
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order._id.substring(18)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.user ? order.user.firstName : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.totalPrice.toFixed(2)}</td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.paymentMethod === 'Cash on Delivery (COD)' ? 'COD' : order.paymentMethod}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        {order.isPaid ? (
                                            <FaCheck className='text-green-500 mx-auto' />
                                        ) : (
                                            <FaTimes className='text-red-500 mx-auto' />
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        {order.isDelivered ? (
                                            <FaCheck className='text-green-500 mx-auto' />
                                        ) : (
                                            <FaTimes className='text-red-500 mx-auto' />
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                        
                                        <Link to={`/admin/order/${order._id}`}> 
                                            <Button variant="info" className='!py-1 !px-2 text-xs flex items-center'>
                                                <FaEdit className='mr-1' /> View
                                            </Button>
                                        </Link>

                                        {!order.isDelivered && order.isPaid && (
                                            <Button 
                                                variant="success" 
                                                className='!py-1 !px-2 text-xs flex items-center'
                                                onClick={() => deliverHandler(order._id)}
                                                disabled={isLoading}
                                            >
                                                <FaTruck className='mr-1' /> Deliver
                                            </Button>
                                        )}

                                        <Button 
                                            variant="danger" 
                                            className='!py-1 !px-2 text-xs flex items-center'
                                            onClick={() => deleteHandler(order._id)}
                                            disabled={isLoading || order.isDelivered}
                                            style={{ opacity: order.isDelivered ? 0.5 : 1, cursor: order.isDelivered ? 'not-allowed' : 'pointer' }}
                                        >
                                            <FaTrashAlt />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {pages > 1 && (
                <div className="mt-8">
                    <Pagination 
                        pages={pages} 
                        page={page} 
                        onPageChange={setCurrentPage} 
                    />
                </div>
            )}
        </div>
    );
};

export default OrderListPage;