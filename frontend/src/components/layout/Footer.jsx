// src/components/layout/Footer.jsx

import React from 'react';
import { FaHeart } from 'react-icons/fa';

const Footer = () => {
    // Calculate the current year dynamically
    const currentYear = new Date().getFullYear(); 

    return (
        <footer className="bg-gray-900 text-white mt-12 py-6">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-gray-400">
                    &copy; {currentYear} Mobile Mania Store. All Rights Reserved.
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center justify-center">
                    Built with <FaHeart className="text-red-500 mx-1" /> and React/Redux Toolkit.
                </p>
            </div>
        </footer>
    );
};

export default Footer;