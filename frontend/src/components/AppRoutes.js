import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { LoadingSpinner } from './ui';
import { usePrefetchRoute } from '../hooks';

/**
 * Enhanced loading fallback with delayed appearance and progress indication
 * This prevents flickering for fast loads and provides better UX for slower loads
 */
const LoadingFallback = () => {
  const [showSpinner, setShowSpinner] = useState(false);
  
  // Only show loading spinner after a delay to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), 300);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 bg-opacity-50">
      {showSpinner && (
        <div className="p-8 rounded-lg bg-gray-800 shadow-lg flex flex-col items-center">
          <LoadingSpinner size="lg" variant="primary" />
          <p className="mt-4 text-gray-300 font-medium">Loading application...</p>
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced lazy loading with retry capability and chunk naming
 * This improves error resilience and debugging capabilities
 */
const enhancedLazy = (importFn, chunkName) => {
  return lazy(() => 
    importFn().catch(error => {
      console.error(`Error loading chunk ${chunkName}:`, error);
      // Retry once after a short delay
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(importFn());
        }, 1000);
      });
    })
  );
};

// Lazy load route components with chunk naming for better debugging
const PublicLandingPage = enhancedLazy(() => import(/* webpackChunkName: "landing" */ './PublicLandingPage'), 'landing');
const SignupPage = enhancedLazy(() => import(/* webpackChunkName: "auth" */ './SignupPage'), 'auth');
const LoginPage = enhancedLazy(() => import(/* webpackChunkName: "auth" */ './LoginPage'), 'auth');
const UserProfilePage = enhancedLazy(() => import(/* webpackChunkName: "profile" */ './UserProfilePage'), 'profile');
const AppDashboard = enhancedLazy(() => import(/* webpackChunkName: "dashboard" */ './AppDashboard'), 'dashboard');
const JobTicketFormPage = enhancedLazy(() => import(/* webpackChunkName: "job-ticket-form" */ './JobTicketFormPage'), 'job-ticket-form');
const VoiceRecorderPage = enhancedLazy(() => import(/* webpackChunkName: "voice-recorder" */ './VoiceRecorderPage'), 'voice-recorder');
const AuthTestPage = enhancedLazy(() => import(/* webpackChunkName: "auth-test" */ './AuthTestPage'), 'auth-test');

/**
 * Route configuration for prefetching and organization
 */
const routeConfig = {
  '/': PublicLandingPage,
  '/signup': SignupPage,
  '/login': LoginPage,
  '/auth-test': AuthTestPage,
  '/dashboard': AppDashboard,
  '/profile': UserProfilePage,
  '/job-ticket-form': JobTicketFormPage,
  '/voice-recorder': VoiceRecorderPage
};

/**
 * AppRoutes component
 * Manages all application routes and their access control with performance optimizations
 */
const AppRoutes = () => {
  const location = useLocation();
  
  // Use our custom hook to prefetch routes based on current location
  usePrefetchRoute(routeConfig);
  
  // Track page transitions for analytics and performance monitoring
  useEffect(() => {
    // Performance measurement
    const navigationStart = performance.now();
    
    // Mark the navigation in performance timeline
    performance.mark(`route-change-${location.pathname}`);
    
    // You could send analytics here
    // analytics.pageView(location.pathname);
    
    // Measure and log navigation performance
    return () => {
      const navigationTime = performance.now() - navigationStart;
      console.log(`Navigation to ${location.pathname} took ${navigationTime.toFixed(2)}ms`);
      
      // Clear performance marks to avoid memory leaks
      performance.clearMarks(`route-change-${location.pathname}`);
    };
  }, [location.pathname]);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
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
          <Route path="/job-ticket-form" element={<JobTicketFormPage />} />
          <Route path="/voice-recorder" element={<VoiceRecorderPage />} />
        </Route>
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
