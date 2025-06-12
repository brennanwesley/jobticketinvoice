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
const AuthTestPage = enhancedLazy(() => import(/* webpackChunkName: "auth-test" */ './AuthTestPage'), 'auth-test');
const AppDashboard = enhancedLazy(() => import(/* webpackChunkName: "dashboard" */ './AppDashboard'), 'dashboard');
const UserProfilePage = enhancedLazy(() => import(/* webpackChunkName: "profile" */ './profile/ProfilePage'), 'profile');
const JobTicketFormPage = enhancedLazy(() => import(/* webpackChunkName: "job-ticket-form" */ './JobTicketFormPage'), 'job-ticket-form');
const VoiceRecorderPage = enhancedLazy(() => import(/* webpackChunkName: "voice-recorder" */ './VoiceRecorderPage'), 'voice-recorder');
const SubmittedTicketList = enhancedLazy(() => import(/* webpackChunkName: "submitted-tickets" */ './tickets/SubmittedTicketList'), 'submitted-tickets');
const DraftTicketList = enhancedLazy(() => import(/* webpackChunkName: "draft-tickets" */ './tickets/DraftTicketList'), 'draft-tickets');
const LandingPage = enhancedLazy(() => import(/* webpackChunkName: "landing" */ './LandingPage'), 'landing');
const JobTicketFormSelector = enhancedLazy(() => import(/* webpackChunkName: "job-ticket-selector" */ './tickets/JobTicketFormSelector'), 'job-ticket-selector');
const ManagerDashboard = enhancedLazy(() => import(/* webpackChunkName: "manager-dashboard" */ './manager/ManagerDashboard'), 'manager-dashboard');

/**
 * Route configuration for prefetching and organization
 */
const routeConfig = {
  '/': PublicLandingPage,
  '/signup': SignupPage,
  '/login': LoginPage,
  '/auth-test': AuthTestPage,
  '/dashboard': AppDashboard,
  '/manager-dashboard': ManagerDashboard,
  '/profile': UserProfilePage,
  '/job-ticket-form': JobTicketFormPage,
  '/voice-recorder': VoiceRecorderPage,
  '/submitted': SubmittedTicketList,
  '/drafts': DraftTicketList,
  '/landing': LandingPage
};

/**
 * AppRoutes component
 * Manages all application routes and their access control with performance optimizations
 * 
 * LAYOUT STRUCTURE:
 * - Public routes are rendered directly without the dashboard layout
 * - All protected routes that need the sidebar and dashboard layout are nested under /dashboard/*
 * - Routes like /landing, /job-ticket-form, etc. are redirected to their /dashboard/* equivalents
 *   to ensure they always render with the sidebar and correct background
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
        
        {/* Protected routes - All routes that require authentication */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard with sidebar layout - All authenticated pages should be nested here */}
          <Route path="/dashboard/*" element={<AppDashboard />} />
          
          {/* These routes should be rendered within the dashboard layout */}
          {/* We'll move these inside the AppDashboard component's Routes */}
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/job-ticket-form" element={<JobTicketFormPage />} /> {/* Manual form entry */}
          <Route path="/job-ticket-selector" element={<JobTicketFormSelector />} /> {/* Form selector based on job type */}
          <Route path="/voice-recorder" element={<VoiceRecorderPage />} /> {/* Voice recording entry */}
          <Route path="/submitted" element={<SubmittedTicketList />} /> {/* Submitted tickets list */}
          <Route path="/drafts" element={<DraftTicketList />} /> {/* Draft tickets list */}
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          
          {/* Landing page should also be within the dashboard layout */}
          <Route path="/landing" element={<Navigate to="/dashboard/landing" replace />} />
        </Route>
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
