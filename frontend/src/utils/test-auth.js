/**
 * Authentication Test Utilities
 * 
 * This file contains test functions to verify the authentication system
 * Run these functions in the browser console to test authentication endpoints
 */

import { getToken, setToken, removeToken, isTokenExpired, parseToken } from './auth';

/**
 * Test user registration
 * @param {Object} userData - User data for registration
 * @returns {Promise<Object>} - Registration result
 */
export const testRegister = async (userData = null) => {
  console.log('🔍 Testing user registration...');
  
  // Default test data if none provided
  const testData = userData || {
    name: 'Test User',
    email: `test${Math.floor(Math.random() * 10000)}@example.com`, // Random email to avoid conflicts
    password: 'Password123!',
    role: 'tech',
    job_type: 'pump_service_technician'
  };
  
  console.log('📤 Sending registration request with data:', testData);
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!', data);
      console.log('🔑 Token received:', data.access_token);
      
      // Store token for subsequent tests
      setToken(data.access_token);
      console.log('💾 Token stored in localStorage');
      
      // Parse and display token info
      const tokenInfo = parseToken(data.access_token);
      console.log('📋 Token info:', tokenInfo);
      console.log('⏱️ Token expiration:', new Date(tokenInfo.exp * 1000).toLocaleString());
      console.log('🔒 Is token expired?', isTokenExpired(data.access_token));
      
      return { success: true, data };
    } else {
      console.error('❌ Registration failed:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    return { success: false, error };
  }
};

/**
 * Test user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Login result
 */
export const testLogin = async (email = 'test@example.com', password = 'Password123!') => {
  console.log(`🔍 Testing login with email: ${email}`);
  
  try {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!', data);
      console.log('🔑 Token received:', data.access_token);
      
      // Store token for subsequent tests
      setToken(data.access_token);
      console.log('💾 Token stored in localStorage');
      
      // Parse and display token info
      const tokenInfo = parseToken(data.access_token);
      console.log('📋 Token info:', tokenInfo);
      console.log('⏱️ Token expiration:', new Date(tokenInfo.exp * 1000).toLocaleString());
      console.log('🔒 Is token expired?', isTokenExpired(data.access_token));
      
      return { success: true, data };
    } else {
      console.error('❌ Login failed:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error };
  }
};

/**
 * Test getting user profile
 * @returns {Promise<Object>} - Profile result
 */
export const testGetProfile = async () => {
  console.log('🔍 Testing get profile...');
  
  const token = getToken();
  
  if (!token) {
    console.error('❌ No token found. Please login first.');
    return { success: false, error: 'No token found' };
  }
  
  if (isTokenExpired(token)) {
    console.error('❌ Token is expired. Please login again.');
    return { success: false, error: 'Token expired' };
  }
  
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Profile retrieved successfully!', data);
      return { success: true, data };
    } else {
      console.error('❌ Failed to get profile:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Profile error:', error);
    return { success: false, error };
  }
};

/**
 * Test logo upload for manager accounts
 * @param {File} logoFile - Logo file to upload
 * @returns {Promise<Object>} - Upload result
 */
export const testLogoUpload = async (logoFile) => {
  console.log('🔍 Testing logo upload...');
  
  if (!logoFile) {
    console.error('❌ No file provided');
    return { success: false, error: 'No file provided' };
  }
  
  const token = getToken();
  
  if (!token) {
    console.error('❌ No token found. Please login first.');
    return { success: false, error: 'No token found' };
  }
  
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    const response = await fetch('/api/auth/logo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Logo uploaded successfully!', data);
      return { success: true, data };
    } else {
      console.error('❌ Failed to upload logo:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Logo upload error:', error);
    return { success: false, error };
  }
};

/**
 * Test logout
 * @returns {Object} - Logout result
 */
export const testLogout = () => {
  console.log('🔍 Testing logout...');
  
  try {
    removeToken();
    console.log('✅ Logout successful! Token removed from localStorage');
    return { success: true };
  } catch (error) {
    console.error('❌ Logout error:', error);
    return { success: false, error };
  }
};

// Make test functions available in the global scope for console testing
window.testRegister = testRegister;
window.testLogin = testLogin;
window.testGetProfile = testGetProfile;
window.testLogoUpload = testLogoUpload;
window.testLogout = testLogout;

// Export all test functions
export default {
  testRegister,
  testLogin,
  testGetProfile,
  testLogoUpload,
  testLogout
};
