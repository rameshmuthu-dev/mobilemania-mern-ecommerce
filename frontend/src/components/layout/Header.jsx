import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    FaShoppingCart, FaUser, FaSignOutAlt, FaHeart, FaBars, FaTimes,
    FaMobileAlt, FaTabletAlt, FaHome, FaAngleRight, FaAngleDown, FaAngleUp,
    FaClipboardList
} from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import SearchBox from './SearchBox';


const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);


    const { user } = useSelector((state) => state.auth);
    const { cartItems } = useSelector((state) => state.cart);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);

    const isAdmin = user && user.isAdmin;

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const wishlistCount = wishlistItems ? wishlistItems.length : 0;


    const logoutHandler = () => {
        dispatch(logout());
        navigate('/login');
        setIsDropdownOpen(false);
        setIsMenuOpen(false);
    };


    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const getUserName = () => {
        if (!user) return 'Profile';
        const namePart = user.firstName || user.name;
        return namePart ? namePart.split(' ')[0] : 'Profile';
    }


    // --- Desktop Navigation Icons ---
    const NavIcons = (
        <nav className="flex items-center space-x-6">

            {/* Wishlist Icon (HIDES for Admin) */}
            {!isAdmin && (
                <Link to="/wishlist" className="relative text-white hover:text-red-300 transition duration-200 p-2">
                    <FaHeart size={24} />
                    {wishlistCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-700 rounded-full">
                            {wishlistCount}
                        </span>
                    )}
                </Link>
            )}


            {/* Cart Icon (HIDES for Admin) */}
            {!isAdmin && (
                <Link to="/cart" className="relative text-white hover:text-gray-900 transition duration-200 p-2">
                    <FaShoppingCart size={24} />
                    {cartCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-700 rounded-full">
                            {cartCount}
                        </span>
                    )}
                </Link>
            )}

            {/* User/Auth Section (Desktop Dropdown) */}
            {user ? (
                // --- LOGGED IN: Show User Dropdown ---
                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-600 py-2 px-4 rounded-lg transition duration-200 focus:outline-none text-white font-medium"
                    >
                        <FaUser className="w-4 h-4" />
                        <span className="hidden sm:inline">{getUserName()}</span>
                        {isDropdownOpen ? <FaAngleUp size={14} /> : <FaAngleDown size={14} />}
                    </button>

                    {/* Dropdown Menu Content */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-200 z-30 overflow-hidden">

                            {/* My Profile Link */}
                            <Link
                                to="/profile"
                                className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition duration-150"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <FaUser className="mr-3 text-lime-600" /> My Profile
                            </Link>

                            {/* My Orders Link (HIDES for Admin) */}
                            {!isAdmin && (
                                <Link
                                    to="/myorders"
                                    className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition duration-150"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <FaClipboardList className="mr-3 text-lime-600" /> My Orders
                                </Link>
                            )}

                            {user.isAdmin && (
                                <Link
                                    to="/admin"
                                    className="flex items-center px-4 py-2 text-sm text-gray-800 bg-red-100 font-bold hover:bg-gray-200 transition duration-150 border-t border-gray-100"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <FaClipboardList className="mr-3 text-red-600" /> Admin Panel
                                </Link>
                            )}


                            {/* Logout Button */}
                            <button
                                onClick={logoutHandler}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-150 border-t border-gray-100"
                            >
                                <FaSignOutAlt className="mr-3" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // --- LOGGED OUT: Show Sign In Button ---
                <Link
                    to="/login"
                    className="text-white hover:text-white transition duration-200 flex items-center bg-lime-500 px-3 py-2 rounded-lg font-medium"
                >
                    <FaUser className="mr-1" /> Sign In
                </Link>
            )}
        </nav>
    );


    return (
        <header className="bg-gray-700 text-white shadow-lg sticky top-0 z-50">

            {/* 1. TOP ROW: Logo, Search (Desktop), and Icons */}
            <div className="container mx-auto px-4 py-3 flex justify-between items-center relative">

                {/* Logo/Brand Name */}
                <Link to="/" className="flex items-center space-x-2 text-black text-2xl font-bold tracking-wider hover:text-white transition duration-200">
                    <span className='text-2xl font-extrabold text-lime-500'>Mobile Mania</span>
                </Link>

                {/* Search Box on MEDIUM/LARGE screens */}
                <div className="hidden md:flex flex-grow justify-center mx-8">
                    <SearchBox />
                </div>


                {/* Desktop Navigation Icons */}
                <div className="hidden md:block">
                    {NavIcons}
                </div>


                {/* Mobile Icons and Hamburger Menu (Visible ONLY on small screens) */}
                <div className="md:hidden flex items-center">

                    {/* Mobile Navigation Icons (Wishlist, Cart, and SignIn) */}
                    <div className="flex items-center space-x-4 mr-4">

                        {/* Mobile Wishlist Icon (HIDES for Admin) */}
                        {!isAdmin && (
                            <Link to="/wishlist" className="relative text-white p-2">
                                <FaHeart size={24} />
                                {wishlistCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-700 rounded-full">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                        )}


                        {/* Mobile Cart Icon (HIDES for Admin) */}
                        {!isAdmin && (
                            <Link to="/cart" className="relative text-white p-2">
                                <FaShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-700 rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}


                        <Link to={user ? "/profile" : "/login"} className="relative text-white p-2">
                            <FaUser size={24} />
                        </Link>
                    </div>


                    {/* Hamburger Button */}
                    <button
                        onClick={toggleMenu}
                        className="text-white p-2 focus:outline-none bg-gray-600 rounded-md hover:bg-gray-500 transition"
                        aria-label="Toggle menu"
                    >
                        <FaBars size={24} />
                    </button>
                </div>
            </div>


            {/* 2. MOBILE SEARCH BAR */}
            <div className="md:hidden px-4 pb-3">
                <SearchBox />
            </div>


            {/* 3. OFF-CANVAS SIDEBAR / DRAWER MENU */}
            {/* Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
                    onClick={toggleMenu}
                ></div>
            )}


            {/* Actual Drawer Container */}
            <div
                className={`fixed top-0 left-0 w-64 h-full bg-white text-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
                }
            >
                {/* Drawer Header (Close Button) */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Shop Menu</h2>
                    <button
                        onClick={toggleMenu}
                        className="text-gray-600 hover:text-red-600 p-2 rounded-full focus:outline-none"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>


                {/* Drawer Links (Categories & Navigation) */}
                <nav className="p-4 space-y-2">
                    {/* Home Link */}
                    <Link to="/" className="flex items-center justify-between py-2 px-3 text-lg font-medium text-gray-700 hover:bg-lime-50 rounded-lg transition" onClick={toggleMenu}>
                        <div className="flex items-center space-x-3">
                            <FaHome className="text-xl text-lime-500" />
                            <span>Home</span>
                        </div>
                        <FaAngleRight className="text-gray-400 text-sm" />
                    </Link>


                    
                    {/* Authentication Links (Profile/Logout) */}
                    {user && (
                        <div className="pt-4 border-t mt-4 border-gray-200">
                            {/* My Profile Link */}
                            <Link to="/profile" className="flex items-center justify-between py-2 px-3 text-lg font-medium text-gray-700 hover:bg-lime-50 rounded-lg transition" onClick={toggleMenu}>
                                <div className="flex items-center space-x-3">
                                    <FaUser className="text-xl text-lime-500" />
                                    <span>My Profile</span>
                                </div>
                                <FaAngleRight className="text-gray-400 text-sm" />
                            </Link>


                            {/* My Orders Link (HIDES for Admin) */}
                            {!isAdmin && (
                                <Link to="/myorders" className="flex items-center justify-between py-2 px-3 text-lg font-medium text-gray-700 hover:bg-lime-50 rounded-lg transition" onClick={toggleMenu}>
                                    <div className="flex items-center space-x-3">
                                        <FaClipboardList className="text-xl text-lime-500" />
                                        <span>My Orders</span>
                                    </div>
                                    <FaAngleRight className="text-gray-400 text-sm" />
                                </Link>
                            )}

                            {user.isAdmin && (
                                <Link
                                    to="/admin"
                                    className="flex items-center px-4 py-2 text-sm text-gray-800 bg-red-100 font-bold hover:bg-gray-200 transition duration-150 border-t border-gray-100"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <FaClipboardList className="mr-3 text-red-600" /> Admin Panel
                                </Link>
                            )}


                            <button onClick={logoutHandler} className="w-full text-left py-2 px-3 text-lg text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center space-x-3 mt-2">
                                <FaSignOutAlt size={18} /> <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};


export default Header;