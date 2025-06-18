// Job Ticket Invoice App - Testing Vercel Auto-Deploy (2025-06-17)
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ManagerProvider } from './context/ManagerContext';
import TicketProvider from './context/TicketProvider';
import AppRoutes from './components/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';
import { MainLayout } from './components/layout';
import { initializeStorageCleanup } from './utils/storageCleanup';

// Multi-tenancy backend API integration ready - v0.2.0

/**
 * Main App component
 * Provides context providers and manages layout
 */
const App = () => {
  // Run storage cleanup on app initialization to fix corrupted localStorage
  useEffect(() => {
    try {
      // Force cleanup on first load to ensure we start with clean state
      const cleanupStats = initializeStorageCleanup(true);
      console.log('Storage cleanup on app initialization:', cleanupStats);
    } catch (error) {
      console.error('Error during storage cleanup:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <LanguageProvider>
          <AuthProvider>
            <ManagerProvider>
              <TicketProvider>
                <MainLayout>
                  <AppRoutes />
                </MainLayout>
              </TicketProvider>
            </ManagerProvider>
          </AuthProvider>
        </LanguageProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
