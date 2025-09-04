import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLogin, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { AppbarAuth } from '../components/AppbarAuth';
import { useLogin } from '../api/hooks';
import type { LoginRequest } from '../api/types';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string>('');
  
  // Use login mutation hook
  const loginMutation = useLogin();
  
  // Development helper untuk auto-fill credentials
  const fillTestCredentials = () => {
    setEmailOrPhone('08211239608');
    setPassword('123456');
    console.log('🧪 Test credentials filled (from API example)');
  };
  
  // Add to window for debugging (development only)
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    (window as any).fillTestCredentials = fillTestCredentials;
    (window as any).testLogin = () => {
      fillTestCredentials();
      // Auto submit form after short delay
      setTimeout(() => {
        const form = document.querySelector('.login-form') as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }, 500);
    };
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous error
    setLoginError('');
    
    // Prepare login data
    const loginData: LoginRequest = {
      username: emailOrPhone,
      password: password,
      device: '' // Default device type for web
    };

    console.log('🔐 Attempting login with:', { 
      username: emailOrPhone,
      passwordLength: password.length,
      device: ''
    });
    console.log('📤 Exact JSON payload:', JSON.stringify(loginData, null, 2));

    try {
      const response = await loginMutation.mutateAsync(loginData);
      
      console.log('✅ Login response:', response);
      console.log('🔍 Response structure analysis:', {
        hasSuccess: 'success' in response,
        hasToken: 'token' in response,
        hasContent: 'content' in response,
        hasContentToken: response.content?.token ? true : false,
        contentStatus: response.content?.status
      });
      
      // Check if login was successful - handle different response formats
      let isSuccess = false;
      let token = '';
      let message = '';
      
      // Handle different response structures
      if (response.success === true) {
        // Standard success format
        isSuccess = true;
        token = response.token || response.data?.token || '';
        message = response.message || 'Login successful';
        console.log('📋 Using standard success format');
      } else if (response.content && response.content.token) {
        // API format: { content: { token, status, userid } }
        isSuccess = response.content.status === 1; // status 1 = success
        token = response.content.token;
        message = isSuccess ? 'Login successful' : 'Login failed';
        console.log('� Using content format - Status:', response.content.status);
      } else if (response.token) {
        // Direct token format
        isSuccess = true;
        token = response.token;
        message = response.message || 'Login successful';
        console.log('📋 Using direct token format');
      } else {
        // Error format
        isSuccess = false;
        message = response.message || 'Login failed';
        console.log('📋 No valid token found in response');
      }
      
      if (isSuccess && token) {
        // Save token to localStorage
        localStorage.setItem('authToken', token);
        
        // Save additional user info if available from content
        if (response.content) {
          localStorage.setItem('userId', response.content.userid.toString());
          localStorage.setItem('userLog', response.content.log.toString());
          console.log('👤 User info saved:', {
            userId: response.content.userid,
            log: response.content.log
          });
        }
        
        console.log('💾 Token saved to localStorage:', token.substring(0, 20) + '...');
        console.log('🎉 Login successful! Redirecting to dashboard...');
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        // Handle API error response
        setLoginError(message);
        console.error('❌ Login failed:', message);
        console.error('🔍 Full response for debugging:', response);
      }
    } catch (error: any) {
      // Handle network or other errors
      let errorMessage = 'Network error occurred';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setLoginError(errorMessage);
      console.error('❌ Login error:', error);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
        <AppbarAuth 
          title="Login" 
          onBack={handleBackClick} 
        />
      <div className="login-card">
        {/* Debug panel - development only */}
        {import.meta.env.DEV && (
          <div style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            <strong>🔧 Dev Tools:</strong><br/>
            <button 
              onClick={fillTestCredentials}
              style={{fontSize: '10px', marginTop: '5px'}}
              type="button"
            >
              Fill Test Credentials
            </button>
          </div>
        )}
        
        <h1 className="login-title">Welcome Back!</h1>
        
        <form onSubmit={handleLogin} className="login-form">
          {/* Error message display */}
          {loginError && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '5px',
              color: '#721c24',
              fontSize: '14px'
            }}>
              ❌ {loginError}
            </div>
          )}
          
          {/* Loading indicator */}
          {loginMutation.isPending && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#cce5f0',
              border: '1px solid #bee5eb',
              borderRadius: '5px',
              color: '#0c5460',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              ⏳ Logging in...
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="emailOrPhone" className="form-label">
              Email / Phone Number
            </label>
            <input
              type="text"
              id="emailOrPhone"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="form-input"
              placeholder="Enter your email or phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input password-input"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <div className="form-links">
            <button
              type="button"
              onClick={handleRegisterClick}
              className="link-button register-link"
            >
              Register Now
            </button>
            <span className="link-separator">|</span>
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="link-button forgot-link"
            >
              Forgot Password
            </button>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loginMutation.isPending || !emailOrPhone || !password}
          >
            <MdLogin className="login-icon" />
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
