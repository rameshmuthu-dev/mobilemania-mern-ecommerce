// src/components/layout/SearchBox.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SearchBox = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');

    const submitHandler = (e) => {
        e.preventDefault();
        
        if (keyword.trim()) {
            navigate(`/search/${keyword.trim()}`);
            setKeyword('');
        } else {
            navigate('/');
        }
    };

    return (
        <form onSubmit={submitHandler} className="relative w-full max-w-lg mx-auto">
            <div className="relative overflow-hidden bg-white border border-gray-300 rounded-lg shadow-sm">
                <input
                    type="text"
                    name="q"
                    onChange={(e) => setKeyword(e.target.value)}
                    value={keyword}
                    // Static Placeholder
                    placeholder="Search products..." 
                    className="w-full p-2.5 pr-10 text-gray-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
            </div>
            
            <button 
                type="submit" 
                className="absolute right-0 top-0 h-full w-10 text-gray-500 flex items-center justify-center hover:text-indigo-600 transition duration-150"
            >
                <FaSearch size={18} />
            </button>
        </form>
    );
};

export default SearchBox;