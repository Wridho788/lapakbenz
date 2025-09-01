import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSend, MdArrowBack } from 'react-icons/md';
import { AppbarAuth } from '../components/AppbarAuth';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Forgot password request:', emailOrPhone);
    setIsSubmitted(true);
    // TODO: Implement forgot password logic
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResend = () => {
    console.log('Resend request for:', emailOrPhone);
    // TODO: Implement resend logic
  };

  const handleAppbarBack = () => {
    navigate('/login');
  };

  const handleCartClick = () => {
    console.log('Cart clicked from ForgotPassword');
    navigate('/cart');
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-page">
        <AppbarAuth title="Reset Password" onBack={handleAppbarBack} />
        <div className="forgot-password-card">
          <h1 className="forgot-password-title">Check Your Email</h1>
          <div className="success-content">
            <p className="success-message">
              We've sent a password reset link to <strong>{emailOrPhone}</strong>
            </p>
            <p className="instruction-text">
              Please check your email and click the link to reset your password.
            </p>
            <div className="action-buttons">
              <button type="button" onClick={handleResend} className="resend-button">
                <MdSend className="button-icon" />
                Resend Email
              </button>
              <button type="button" onClick={handleBackToLogin} className="back-button">
                <MdArrowBack className="button-icon" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <AppbarAuth title="Forgot Password" onBack={handleAppbarBack} />
      <div className="forgot-password-card">
        <h1 className="forgot-password-title">Forgot Password</h1>
        {/* <p className="forgot-password-subtitle">Input your e-mail/phone number </p> */}

        <form onSubmit={handleSubmit} className="forgot-password-form">
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
              placeholder="Input your e-mail/phone number"
              required
            />
          </div>

          <button type="submit" className="send-button">
            <MdSend className="button-icon" />
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
