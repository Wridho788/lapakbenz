import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPersonAdd, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import './Register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: ''
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register attempt:', formData);
    // TODO: Implement register logic
    // For now, navigate to login
    navigate('/login');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleBackClick = () => {
    navigate('/login');
  };

  return (
    <div className="register-page">
      <AppbarDefault title="Register" onBack={handleBackClick} />
      <div className="register-card">
        <h1 className="register-title">Register Now!</h1>
        
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="emailOrPhone" className="form-label">
              Email / Phone Number
            </label>
            <input
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleInputChange}
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
                name="password"
                value={formData.password}
                onChange={handleInputChange}
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input password-input"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="password-toggle-btn"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <button type="submit" className="register-button">
            <MdPersonAdd className="register-icon" />
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
