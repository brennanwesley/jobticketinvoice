import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, setToken as setAuthToken, removeToken, isAuthenticated, parseToken, isTokenExpired, authenticatedFetch } from '../utils/auth';

// Create the context
const AuthContext = createContext();

/**
 * Provider component for authentication context
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken() || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          removeToken();
          setToken(null);
          setLoading(false);
          return;
        }
        
        try {
          const response = await authenticatedFetch('/api/auth/me');
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid
            removeToken();
            setToken(null);
          }
        } catch (err) {
          console.error('Error checking authentication:', err);
          setError('Error checking authentication');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [token]);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    // DEVELOPMENT ONLY: Hardcoded admin account for testing
    // TODO: REMOVE THIS BEFORE PRODUCTION DEPLOYMENT
    if (email === 'BrennanWesley' && password === 'admin000') {
      console.log('DEV MODE: Using hardcoded admin account');
      // Set a mock token and user for the admin
      const mockToken = 'dev-admin-token';
      setAuthToken(mockToken);
      setToken(mockToken);
      
      // Set admin user data
      const adminUser = {
        id: 'admin-dev',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        is_dev_admin: true // Flag to identify this is the dev admin account
      };
      setUser(adminUser);
      
      return { success: true, is_dev_admin: true };
    }
    
    try {
      const formData = new FormData();
      formData.append('username', email); // OAuth2 expects 'username' field
      formData.append('password', password);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token in localStorage and state
        setAuthToken(data.access_token);
        setToken(data.access_token);
        
        // Get user data
        const userResponse = await authenticatedFetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
        
        return { success: true };
      } else {
        setError(data.detail || 'Login failed');
        return { success: false, error: data.detail || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error during login');
      return { success: false, error: 'Network error during login' };
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Auto login after registration
        return await login(userData.email, userData.password);
      } else {
        setError(data.detail || 'Registration failed');
        return { success: false, error: data.detail || 'Registration failed' };
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error during registration');
      return { success: false, error: 'Network error during registration' };
    } finally {
      setLoading(false);
    }
  };
  
  // Upload logo function (for manager users)
  const uploadLogo = async (file) => {
    if (!token) {
      setError('Not authenticated');
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/auth/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update user data with new logo URL
        setUser(prev => ({ ...prev, logo_url: data.url }));
        return { success: true, url: data.url };
      } else {
        setError(data.detail || 'Logo upload failed');
        return { success: false, error: data.detail || 'Logo upload failed' };
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      setError('Network error during logo upload');
      return { success: false, error: 'Network error during logo upload' };
    }
  };
  
  // Logout function
  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
  };
  
  // Context value
  const contextValue = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    uploadLogo,
    logout
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
