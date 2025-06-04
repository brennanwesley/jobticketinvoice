/**
 * Test script for verifying authentication flow
 * 
 * This script can be used to manually test the authentication functionality by:
 * 1. Opening the browser console
 * 2. Running the testAuth() function
 * 3. Checking the console output for any errors
 */

const testAuth = async () => {
  console.log('=== Authentication Testing ===');
  
  // Test user data
  const techUser = {
    name: 'Test Tech',
    email: 'tech@example.com',
    password: 'password123',
    role: 'tech',
    job_type: 'pump_service_technician'
  };
  
  const managerUser = {
    name: 'Test Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
    company_name: 'Test Company'
  };
  
  // Test registration
  console.log('\nTesting tech user registration:');
  try {
    const techRegResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(techUser)
    });
    
    const techRegData = await techRegResponse.json();
    console.log('Tech registration response:', techRegData);
    
    if (!techRegResponse.ok) {
      console.error('Tech registration failed:', techRegData.detail || 'Unknown error');
    } else {
      console.log('Tech registration successful!');
    }
  } catch (error) {
    console.error('Tech registration error:', error);
  }
  
  console.log('\nTesting manager user registration:');
  try {
    const managerRegResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(managerUser)
    });
    
    const managerRegData = await managerRegResponse.json();
    console.log('Manager registration response:', managerRegData);
    
    if (!managerRegResponse.ok) {
      console.error('Manager registration failed:', managerRegData.detail || 'Unknown error');
    } else {
      console.log('Manager registration successful!');
    }
  } catch (error) {
    console.error('Manager registration error:', error);
  }
  
  // Test login
  console.log('\nTesting tech user login:');
  let techToken = null;
  try {
    const formData = new FormData();
    formData.append('username', techUser.email);
    formData.append('password', techUser.password);
    
    const techLoginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      body: formData
    });
    
    const techLoginData = await techLoginResponse.json();
    console.log('Tech login response:', techLoginData);
    
    if (!techLoginResponse.ok) {
      console.error('Tech login failed:', techLoginData.detail || 'Unknown error');
    } else {
      console.log('Tech login successful!');
      techToken = techLoginData.access_token;
    }
  } catch (error) {
    console.error('Tech login error:', error);
  }
  
  // Test getting user profile
  if (techToken) {
    console.log('\nTesting get user profile:');
    try {
      const profileResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${techToken}`
        }
      });
      
      const profileData = await profileResponse.json();
      console.log('User profile response:', profileData);
      
      if (!profileResponse.ok) {
        console.error('Get profile failed:', profileData.detail || 'Unknown error');
      } else {
        console.log('Get profile successful!');
      }
    } catch (error) {
      console.error('Get profile error:', error);
    }
  }
  
  return 'Authentication testing completed. See console for results.';
};

// Export for use in browser console
window.testAuth = testAuth;

export default testAuth;
