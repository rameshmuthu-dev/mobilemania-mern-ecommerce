import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import AdminNav from './AdminNav';

const AdminPanelLayout = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user || !user.isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-3"> 
            <div className="container mx-auto px-4">
                <AdminNav /> 
            </div>

            <main className="container mx-auto px-4 pb-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminPanelLayout;