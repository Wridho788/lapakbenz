import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLogin, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { AppbarAuth } from '../components/AppbarAuth';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { emailOrPhone, password });
    // TODO: Implement login logic
    // For now, navigate back to dashboard
    navigate('/dashboard');
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
        <h1 className="login-title">Welcome Back!</h1>
        
        <form onSubmit={handleLogin} className="login-form">
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

          <button type="submit" className="login-button">
            <MdLogin className="login-icon" />
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
