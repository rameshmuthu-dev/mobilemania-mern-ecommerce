// src/components/layout/ProtectedRoute.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * A wrapper component that checks for user authentication.
 * Renders the children (Outlet) if the user is logged in, 
 * otherwise redirects to the login page.
 * * @param {boolean} isAdmin - Optional prop to restrict access to Admins only.
 */
const ProtectedRoute = ({ isAdmin }) => {
    // Get the user object from the Redux auth state
    const { user } = useSelector((state) => state.auth);

    // 1. Check for basic authentication
    if (!user) {
        // User is NOT logged in. Redirect to login and show a warning.
        toast.warn('You must be logged in to view this page.');
        return <Navigate to="/login" replace />;
    }

    // 2. Check for Admin authorization (if isAdmin prop is true)
    if (isAdmin && !user.isAdmin) {
        // User IS logged in, but is NOT an Admin. Redirect to home or show error.
        toast.error('Access Denied. Admin privileges required.');
        return <Navigate to="/" replace />;
    }

    // 3. User is logged in and meets the access criteria (if any)
    // Render the nested route content
    return <Outlet />;
};

export default ProtectedRoute;