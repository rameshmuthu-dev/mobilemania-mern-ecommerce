import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    FaTachometerAlt, 
    FaBox, 
    FaUsers, 
    FaClipboardList, 
    FaImages,
    FaCommentDots
} from 'react-icons/fa';

const AdminNav = () => {
    
    const navLinks = [
        { to: '/admin/dashboard', name: 'Dashboard', icon: FaTachometerAlt }, 
        { to: '/admin/products', name: 'Products', icon: FaBox },
        { to: '/admin/users', name: 'Users', icon: FaUsers },
        { to: '/admin/orders', name: 'Orders', icon: FaClipboardList },
        { to: '/admin/reviews', name: 'Reviews', icon: FaCommentDots },
        { to: '/admin/carousel', name: 'Carousel', icon: FaImages },
    ];

    return (
        <nav className="flex flex-wrap justify-start md:justify-between space-x-2 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"> 
            {navLinks.map((link) => (
                <NavLink
                    key={link.name}
                    to={link.to}
                    className={({ isActive }) => 
                        `flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ease-in-out mb-1
                         ${isActive 
                            ? 'bg-lime-600 text-white shadow-lg shadow-lime-200/50 dark:shadow-none' 
                            : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`
                    }
                >
                    <link.icon className="w-4 h-4" /> 
                    <span>{link.name}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default AdminNav;