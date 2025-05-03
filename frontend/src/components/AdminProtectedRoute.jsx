// frontend/src/components/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
    const adminUserInfo = localStorage.getItem('adminUserInfo');
    let isLoggedIn = false;
    if (adminUserInfo) {
        try {
            const parsedInfo = JSON.parse(adminUserInfo);
            if (parsedInfo && typeof parsedInfo.token === 'string' && parsedInfo.token.length > 0) {
                 isLoggedIn = true;
            }
        } catch (e) {
            console.error("Error parsing adminUserInfo from localStorage", e);
            localStorage.removeItem('adminUserInfo');
        }
    }
    if (isLoggedIn) {
        return <Outlet />;
    } else {
        return <Navigate to="/admin/login" replace />;
    }
};

export default AdminProtectedRoute;