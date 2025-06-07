import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import TicketProvider from './context/TicketProvider';
import AppRoutes from './components/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Main App component
 * Provides context providers and manages layout
 */
const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <LanguageProvider>
          <AuthProvider>
            <TicketProvider>
              <AppRoutes />
            </TicketProvider>
          </AuthProvider>
        </LanguageProvider>
      </Router>
    </ErrorBoundary>
  );
};



export default App;
