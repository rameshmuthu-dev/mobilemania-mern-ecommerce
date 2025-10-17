import React from 'react';
import { Line as LineChartJS, Bar as BarChartJS } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
    Filler
} from 'chart.js';
import { useGetDashboardAnalyticsQuery } from '../../../redux/slices/analyticsSlice'; 
import { FaBoxes, FaChartLine, FaRupeeSign, FaStar, FaUsers } from 'react-icons/fa'; 
import Spinner from '../../ui/Spinner'; // Adjusted path to '../../ui/Spinner'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
    Filler
);

const formatSalesTrend = (data) => {
    return data.map(item => ({
        name: `${item._id.month}/${item._id.year % 100}`, 
        Sales: item.totalSales,
    }));
};

const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// 💡 புதிய function: பெரிய எண்களை சுருக்கி (Lakhs, Crores) காட்ட
const formatChartLabel = (value) => {
    if (Math.abs(value) >= 10000000) { // 1 Crore
        return (value / 10000000).toFixed(1) + ' Cr';
    }
    if (Math.abs(value) >= 100000) { // 1 Lakh
        return (value / 100000).toFixed(0) + ' L';
    }
    if (Math.abs(value) >= 1000) { // 1 Thousand
        return (value / 1000).toFixed(0) + ' K';
    }
    return value.toLocaleString('en-IN');
};

const SalesLineChart = ({ data }) => {
    const chartData = {
        labels: data.map(item => item.name),
        datasets: [
            {
                label: 'Revenue',
                data: data.map(item => item.Sales),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                pointRadius: 5,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `Revenue: ${formatCurrency(context.parsed.y)}`,
                },
            },
        },
        scales: {
            y: {
                ticks: {
                    // 💡 formatChartLabel பயன்படுத்தப்பட்டுள்ளது
                    callback: (value) => formatChartLabel(value),
                },
                grid: { drawBorder: false },
            },
            x: {
                grid: { display: false },
            },
        },
    };

    return <LineChartJS data={chartData} options={options} />;
};

const TopProductsBarChart = ({ data }) => {
    const chartData = {
        labels: data.map(item => item.name),
        datasets: [
            {
                label: 'Units Sold',
                data: data.map(item => item.totalQuantitySold),
                backgroundColor: '#f97316',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            x: { grid: { drawBorder: false } },
            y: { grid: { display: false } },
        },
    };

    return <BarChartJS data={chartData} options={options} />;
};

const AdminDashboard = () => {
    const { data: analyticsData, isLoading, error } = useGetDashboardAnalyticsQuery();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Spinner /> 
            </div>
        );
    }

    if (error) {
        const errorMessage = error?.data?.message || error.error || 'Unknown error occurred.';
        return (
            <div className="p-4 rounded-lg bg-red-100 border border-red-400 text-red-700 max-w-lg mx-auto mt-10" role="alert">
                <p className="font-bold">Error loading Dashboard Data:</p>
                <p>{errorMessage}</p>
            </div>
        );
    }
    
    const data = analyticsData || {}; 
    const salesTrendArray = Array.isArray(data.salesTrend) ? data.salesTrend : [];
    const formattedSalesData = salesTrendArray.length > 0 ? formatSalesTrend(salesTrendArray) : [];

    const topProductsArray = Array.isArray(data.topProducts) ? data.topProducts : [];
    const formattedTopProducts = topProductsArray.map(p => ({
        ...p,
        name: p?.name ? (p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name) : 'Unnamed',
    }));

    const totalRevenue = data.totalRevenue || 0;
    const totalOrders = data.totalOrders || 0;
    const totalReviewsCount = data.totalReviewsCount || 0;
    const totalProductsCount = data.totalProductsCount || 0;
    const totalUsersCount = data.totalUsersCount || 0;

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-white p-5 rounded-lg shadow-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue (Delivered)</p>
                            <h5 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-1">
                                {formatCurrency(totalRevenue)}
                            </h5>
                        </div>
                        <FaRupeeSign className="text-green-500 h-8 w-8 p-1 bg-green-100 rounded-full" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Orders (Delivered)</p>
                            <h5 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-1">
                                {totalOrders.toLocaleString()}
                            </h5>
                        </div>
                        <FaBoxes className="text-blue-500 h-8 w-8 p-1 bg-blue-100 rounded-full" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-lg border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                            <h5 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-1">
                                {totalReviewsCount.toLocaleString()}
                            </h5>
                        </div>
                        <FaStar className="text-yellow-500 h-8 w-8 p-1 bg-yellow-100 rounded-full" />
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow-lg border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Products</p>
                            <h5 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-1">
                                {totalProductsCount.toLocaleString()}
                            </h5>
                        </div>
                        <FaBoxes className="text-purple-500 h-8 w-8 p-1 bg-purple-100 rounded-full" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-lg border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <h5 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-1">
                                {totalUsersCount.toLocaleString()}
                            </h5>
                        </div>
                        <FaUsers className="text-red-500 h-8 w-8 p-1 bg-red-100 rounded-full" />
                    </div>
                </div>
            </div>
            
            <div className="shadow-lg p-6 bg-white rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    <FaChartLine className="mr-2 text-indigo-600" /> Monthly Sales Trend (Last 6 Months)
                </h3>
                <div style={{ width: '100%', height: 350 }}>
                    {formattedSalesData.length > 0 ? (
                        <SalesLineChart data={formattedSalesData} />
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-500">No Sales Data Available</div>
                    )}
                </div>
            </div>

            <div className="shadow-lg p-6 bg-white rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Top 5 Selling Products (Quantity Sold)</h3>
                <div style={{ width: '100%', height: 350 }}>
                    {formattedTopProducts.length > 0 ? (
                        <TopProductsBarChart data={formattedTopProducts} />
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-500">No Product Data Available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;