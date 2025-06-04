import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLandingPage from './PublicLandingPage';
import SignupPage from './SignupPage';
import LoginPage from './LoginPage';
import UserProfilePage from './UserProfilePage';
import AppDashboard from './AppDashboard';
import ProtectedRoute from './ProtectedRoute';
import AuthTestPage from './AuthTestPage';

/**
 * AppRoutes component
 * Manages all application routes and their access control
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth-test" element={<AuthTestPage />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/*" element={<AppDashboard />} />
        <Route path="/profile" element={<UserProfilePage />} />
      </Route>
      
      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
