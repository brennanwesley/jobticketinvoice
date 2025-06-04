import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to check authentication status
 * Returns loading state and authentication status
 * Useful for protected routes and conditional rendering
 */
const useAuthStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // If auth context is no longer loading, update authentication status
    if (!authLoading) {
      setIsAuthenticated(!!user);
      setCheckingStatus(false);
    }
  }, [user, authLoading]);

  return { isAuthenticated, checkingStatus };
};

export default useAuthStatus;
