import React from 'react';
import { Routes, Route } from 'react-router-dom';


// Layout Components
import Header from './components/layout/header' // Ensure correct casing (Header)
import Footer from './components/layout/Footer';
import Container from './components/ui/Container'


// Pages
import HomePage from './components/pages/HomePage'
import ProductPage from './components/pages/ProductPage'
import ProductDetailsPage from './components/pages/ProductDetails'

// <<< 🚀 NEW: Import Authentication Pages >>>




import ShippingAddressPage from './components/order/ShippingAddress'
import PaymentMethodPage from './components/order/PaymentMethod'
import PlaceOrderPage from './components/order/PlaceOrder'
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import CartPage from './components/pages/CartPage';
import WishlistPage from './components/pages/WishlistPage';
import ProfilePage from './components/pages/ProfilePage';
import OrderHistoryPage from './components/pages/OrderHistoryPage';
import OrderSuccess from './components/order/OrderSuccess';
import OrderDetailsModal from './components/pages/OrderDetailsModal';
import OrderDetailsPage from './components/order/OrderDetailsPage';
import ProductListPage from './components/admin/product/ProductListPage';
import AdminPanelLayout from './components/admin/layout/AdminPanelLayout';
import CreateProductPage from './components/admin/product/CreateProductPage';
import EditProductPage from './components/admin/product/EditProductPage';
import UserListPage from './components/admin/user/UserListPage';
import UserCreatePage from './components/admin/user/UserCreatePage';
import UserEditPage from './components/admin/user/UserEditPage';
import OrderListPage from './components/admin/order/OrderListPage';


import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import AdminOrderDetailsPage from './components/admin/order/AdminOrderDetailsPage';
import AdminCarouselListPage from './components/admin/carousel/AdminCarouselListPage';
import AdminCarouselCreatePage from './components/admin/carousel/AdminCarouselCreatePage';
import AdminCarouselEditPage from './components/admin/carousel/AdminCarouselEditPage';
import AdminReviewListPage from './components/admin/review/AdminReviewListPage';



const App = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="py-3 flex-grow">
                <Container>
                    <Routes>

                        {/* ========================================================= */}
                        {/* 🔒 AUTHENTICATION ROUTES */}
                        {/* ========================================================= */}

                        <Route path='/login' element={<LoginPage />} />
                        <Route path='/register' element={<RegisterPage />} />
                        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
                        <Route path='/profile' element={<ProfilePage />} />
                        <Route path='/myorders' element={<OrderHistoryPage />} />



                        {/* ========================================================= */}
                        {/* 🏡 PRODUCT/HOMEPAGE ROUTES */}
                        {/* ========================================================= */}
                        <Route path='/' element={<HomePage />} />
                        <Route path='/search/:keyword' element={<HomePage />} />
                        <Route path='/products' element={<ProductPage />} />

                        <Route path='/product/:id' element={<ProductDetailsPage />} />
                        <Route path='/cart' element={<CartPage />} />
                        <Route path='/wishlist' element={<WishlistPage />} />

                        {/* ========================================================= */}
                        {/* 🛒 CHECKOUT ROUTES */}
                        {/* ========================================================= */}
                        {/* These routes usually need protection, ensuring the user is logged in */}
                        <Route path='/shipping' element={<ShippingAddressPage />} />
                        <Route path='/paymentmethod' element={<PaymentMethodPage />} />
                        <Route path='/placeorder' element={<PlaceOrderPage />} />
                        <Route path='/order/:orderId/success' element={<OrderSuccess />} />
                        <Route path='/order/:orderId' element={<OrderDetailsPage />} />

                        {/* ========================================================= */}
                        {/* 🛡️ ADMIN ROUTES (Products) - NEW ADDITION */}
                        {/* ========================================================= */}
                        <Route path='/admin' element={<AdminPanelLayout />}>

                        {/* Dashboard is the default view for /admin */}
                            <Route index element={<AdminDashboard />} /> 
                            <Route path='dashboard' element={<AdminDashboard />} /> 

                            {/* --- Product Management Routes --- */}
                            <Route path='/admin/products' element={<ProductListPage />} />
                            <Route path='products/create' element={<CreateProductPage />} />
                            <Route path="products/:id/edit" element={<EditProductPage />} />

                            {/* --- User Management Routes --- */}
                            <Route path='/admin/users' element={<UserListPage />} />
                            <Route path='user/create' element={<UserCreatePage />} />
                            <Route path='user/:id/edit' element={<UserEditPage />} />

                            {/* --- order Management Routes --- */}
                            <Route path='orders' element={<OrderListPage />} />
                            <Route path='order/:orderId' element={<AdminOrderDetailsPage />} />

                            {/* --- 🆕 Carousel Management Routes (New) --- */}
                            <Route path='carousel' element={<AdminCarouselListPage />} />
                            <Route path='carousel/create' element={<AdminCarouselCreatePage />} />
                            <Route path='carousel/:id/edit' element={<AdminCarouselEditPage />} />

                            {/* --- 🆕 Review Management Routes (New) --- */}
                            <Route path='reviews' element={<AdminReviewListPage />} />


                        </Route>


                    </Routes>
                </Container>
            </main>


            <Footer />
        </div>
    );
};


export default App;