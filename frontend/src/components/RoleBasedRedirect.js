import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleBasedRedirect component
 * Redirects users to appropriate dashboard based on their role
 * Managers/Admins -> /manager-dashboard
 * Technicians -> /dashboard/landing
 */
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user.role === 'manager' || user.role === 'admin') {
    return <Navigate to="/manager-dashboard" replace />;
  } else {
    return <Navigate to="/dashboard/landing" replace />;
  }
};

export default RoleBasedRedirect;
