import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdVerifiedUser, MdRefresh } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { useRequestOTP } from '../api/hooks';
import Swal from 'sweetalert2';
import './RequestOTP.css';

interface LocationState {
  phone: string;
}

const RequestOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [phoneNumber, setPhoneNumber] = useState(state?.phone || '');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const requestOTPMutation = useRequestOTP();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if no phone number provided
  useEffect(() => {
    if (!phoneNumber) {
      navigate('/register');
    }
  }, [phoneNumber, navigate]);

  const handleRequestOTP = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await requestOTPMutation.mutateAsync({
        username: phoneNumber
      });
      
      console.log('OTP requested successfully:', result);
      
      await Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: `Verification code has been sent to ${phoneNumber}`,
        confirmButtonColor: '#28a745',
        timer: 3000,
        timerProgressBar: true
      });
      
      setIsOtpRequested(true);
      setCountdown(60); // 60 seconds countdown
    } catch (error: any) {
      console.error('Failed to request OTP:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Send OTP',
        text: errorMessage,
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      await Swal.fire({
        icon: 'warning',
        title: 'Incomplete OTP',
        text: 'Please enter all 4 digits of the verification code',
        confirmButtonColor: '#f39c12'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here you would typically call a verify OTP API
      // For now, we'll simulate success and navigate to login
      
      await Swal.fire({
        icon: 'success',
        title: 'Verification Successful!',
        text: 'Your account has been verified. Please login.',
        confirmButtonColor: '#28a745',
        timer: 3000,
        timerProgressBar: true
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: 'Invalid OTP code. Please try again.',
        confirmButtonColor: '#d33'
      });
      
      // Clear OTP inputs
      setOtp(['', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate('/register');
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="request-otp-page">
      <AppbarDefault title="Verify Phone Number" onBack={handleBackClick} />
      <div className="request-otp-card">
        <h1 className="request-otp-title">Phone Verification</h1>
        <p className="request-otp-subtitle">
          We'll send a verification code to confirm your phone number
        </p>

        {/* Phone Number Section */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="form-input"
            placeholder="Enter your phone number"
            disabled
          />
        </div>

        {/* Request OTP Button */}
        {!isOtpRequested ? (
          <button
            type="button"
            className="request-otp-button"
            onClick={handleRequestOTP}
            disabled={isSubmitting || !phoneNumber}
          >
            <span>{isSubmitting ? 'Sending...' : 'Request OTP'}</span>
            <MdRefresh className={`otp-icon ${isSubmitting ? 'spinning' : ''}`} />
          </button>
        ) : (
          <>
            {/* OTP Input Section */}
            <div className="otp-section">
              <label className="form-label otp-label">
                Enter Verification Code
              </label>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="otp-input"
                    maxLength={1}
                    placeholder="0"
                  />
                ))}
              </div>
              <p className="otp-help-text">
                Enter the 4-digit code sent to {phoneNumber}
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              className={`verify-button ${isOtpComplete ? 'active' : ''}`}
              onClick={handleVerifyOTP}
              disabled={!isOtpComplete || isSubmitting}
            >
              <span>{isSubmitting ? 'Verifying...' : 'Verify OTP'}</span>
              <MdVerifiedUser className="verify-icon" />
            </button>

            {/* Resend OTP */}
            <div className="resend-section">
              {countdown > 0 ? (
                <p className="countdown-text">
                  Resend code in {countdown} seconds
                </p>
              ) : (
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleRequestOTP}
                  disabled={isSubmitting}
                >
                  Didn't receive code? <span className="resend-link">Resend</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestOTP;
