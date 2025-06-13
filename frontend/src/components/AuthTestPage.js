import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

/**
 * Auth Test Page component
 * A utility page for testing authentication functionality
 */
const AuthTestPage = () => {
  const { t } = useLanguage();
  const { user, login, register, logout, uploadLogo } = useAuth();
  
  // Test state
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data for tests
  const [loginData, setLoginData] = useState({
    email: 'test@example.com',
    password: 'Password123!'
  });
  
  const [registerData, setRegisterData] = useState({
    name: 'Test User',
    email: `test${Math.floor(Math.random() * 10000)}@example.com`,
    password: 'Password123!',
    role: 'tech',
    job_type: 'pump_service_technician'
  });
  
  // Add a test result
  const addResult = (title, success, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [
      { id: Date.now(), timestamp, title, success, data },
      ...prev
    ]);
  };
  
  // Handle login test
  const handleLoginTest = async () => {
    setIsLoading(true);
    try {
      const result = await login(loginData.email, loginData.password);
      addResult('Login Test', result.success, result);
    } catch (error) {
      addResult('Login Test', false, { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle register test
  const handleRegisterTest = async () => {
    setIsLoading(true);
    try {
      const result = await register(registerData);
      addResult('Register Test', result.success, result);
      
      // Update login email to match registration
      if (result.success) {
        setLoginData(prev => ({ ...prev, email: registerData.email }));
        
        // Generate new random email for next registration
        setRegisterData(prev => ({
          ...prev,
          email: `test${Math.floor(Math.random() * 10000)}@example.com`
        }));
      }
    } catch (error) {
      addResult('Register Test', false, { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle logout test
  const handleLogoutTest = () => {
    try {
      logout();
      addResult('Logout Test', true, { message: 'Successfully logged out' });
    } catch (error) {
      addResult('Logout Test', false, { error: error.message });
    }
  };
  
  // Handle logo upload test
  const handleLogoUploadTest = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      const result = await uploadLogo(file);
      addResult('Logo Upload Test', result.success, result);
    } catch (error) {
      addResult('Logo Upload Test', false, { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input change
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          {t('auth.testPageTitle')}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">{t('auth.testControls')}</h2>
            
            {/* Current User Status */}
            <div className="mb-6 p-4 bg-slate-700 rounded-lg">
              <h3 className="font-medium mb-2">{t('auth.currentStatus')}</h3>
              <p className="text-sm">
                {user ? (
                  <span className="text-green-500">{t('auth.loggedInAs')}: {user.email}</span>
                ) : (
                  <span className="text-red-500">{t('auth.notLoggedIn')}</span>
                )}
              </p>
              {user && (
                <div className="mt-2 text-xs text-gray-400">
                  <p>Role: {user.role}</p>
                  <p>Name: {user.name}</p>
                  {user.role === 'tech' && <p>Job Type: {user.job_type}</p>}
                  {user.role === 'manager' && <p>Company: {user.company_name}</p>}
                </div>
              )}
            </div>
            
            {/* Login Test */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">{t('auth.loginTest')}</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="login-email" className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm text-gray-400 mb-1">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={handleLoginTest}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {isLoading ? t('common.loading') : t('auth.runLoginTest')}
                </button>
              </div>
            </div>
            
            {/* Register Test */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">{t('auth.registerTest')}</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="register-name" className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={handleRegisterInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="register-email" className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="register-password" className="block text-sm text-gray-400 mb-1">Password</label>
                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="register-role" className="block text-sm text-gray-400 mb-1">Role</label>
                  <select
                    id="register-role"
                    name="role"
                    value={registerData.role}
                    onChange={handleRegisterInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="tech">Tech</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                {registerData.role === 'tech' && (
                  <div>
                    <label htmlFor="register-job-type" className="block text-sm text-gray-400 mb-1">Job Type</label>
                    <select
                      id="register-job-type"
                      name="job_type"
                      value={registerData.job_type}
                      onChange={handleRegisterInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="pump_service_technician">Pump Technician</option>
                      <option value="roustabout">Roustabout</option>
                      <option value="electrician">Electrician</option>
                      <option value="pipeline_operator">Pipeline Operator</option>
                      <option value="truck_driver">Truck Driver</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
                {registerData.role === 'manager' && (
                  <div>
                    <label htmlFor="register-company-name" className="block text-sm text-gray-400 mb-1">Company Name</label>
                    <input
                      id="register-company-name"
                      type="text"
                      name="company_name"
                      value={registerData.company_name || ''}
                      onChange={handleRegisterInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                    />
                  </div>
                )}
                <button
                  onClick={handleRegisterTest}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {isLoading ? t('common.loading') : t('auth.runRegisterTest')}
                </button>
              </div>
            </div>
            
            {/* Other Tests */}
            <div className="space-y-3">
              <button
                onClick={handleLogoutTest}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
              >
                {t('auth.runLogoutTest')}
              </button>
              
              {user && user.role === 'manager' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t('auth.logoUploadTest')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUploadTest}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Test Results */}
          <div className="bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">{t('auth.testResults')}</h2>
            
            {testResults.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{t('auth.noTestResults')}</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {testResults.map(result => (
                  <div 
                    key={result.id}
                    className={`p-3 rounded-md border ${
                      result.success ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-red-500 bg-red-900 bg-opacity-20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{result.title}</h3>
                      <span className="text-xs text-gray-400">{result.timestamp}</span>
                    </div>
                    <div className="text-sm">
                      <p className={result.success ? 'text-green-500' : 'text-red-500'}>
                        {result.success ? '✓ Success' : '✗ Failed'}
                      </p>
                      <pre className="mt-2 text-xs bg-slate-900 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {testResults.length > 0 && (
              <button
                onClick={() => setTestResults([])}
                className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-md"
              >
                {t('auth.clearResults')}
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-orange-500 hover:text-orange-400">
            &larr; {t('common.back')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;
