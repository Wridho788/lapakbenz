import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRequestOTP, useForgotPassword } from '../api/hooks/index';
import { useNavigate } from 'react-router-dom';
import { MdSend } from 'react-icons/md';
import { AppbarAuth } from '../components/AppbarAuth';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutate: requestOTP, isPending: isSendingOTP } = useRequestOTP();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      toast.warning('Masukkan email atau nomor HP Anda', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }
    requestOTP(
      { username: emailOrPhone.trim() },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          toast.success('Kode OTP telah dikirim ke email/nomor HP Anda.', {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
        },
        onError: (err: any) => {
          let msg = 'Gagal mengirim OTP.';
          if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
            msg = err.message;
          }
          toast.error(msg, {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
        },
      }
    );
  };


  const handleAppbarBack = () => {
    navigate('/login');
  };

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { mutate: setForgotPassword, isPending: isSettingPassword } = useForgotPassword();

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) {
      toast.warning('OTP dan password baru wajib diisi', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }
    setForgotPassword(
      {
        username: emailOrPhone.trim(),
        new_password: newPassword,
        otp: otp.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Password berhasil diubah! Silakan login dengan password baru Anda.', {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
          setTimeout(() => navigate('/login'), 2000);
        },
        onError: (err: any) => {
          let msg = 'Gagal mengubah password.';
          if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
            msg = err.message;
          }
          toast.error(msg, {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
        },
      }
    );
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-page">
        <AppbarAuth title="Reset Password" onBack={handleAppbarBack} />
        <div className="forgot-password-card">
          <h1 className="forgot-password-title">Set Password Baru</h1>
          <form onSubmit={handleSetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="otp" className="form-label">Kode OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="form-input"
                placeholder="Masukkan kode OTP"
                required
                maxLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">Password Baru</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Masukkan password baru"
                required
              />
            </div>
            <button type="submit" className="send-button" disabled={isSettingPassword}>
              {isSettingPassword ? 'Menyimpan...' : 'Set Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <AppbarAuth title="Lupa Kata Sandi" onBack={handleAppbarBack} />
      <div className="forgot-password-card">
        <h1 className="forgot-password-title">Lupa Kata Sandi</h1>
        {/* <p className="forgot-password-subtitle">Input your e-mail/phone number </p> */}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="emailOrPhone" className="form-label">
              Email / Nomor HP
            </label>
            <input
              type="text"
              id="emailOrPhone"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="form-input"
              placeholder="Masukkan email atau nomor HP Anda"
              required
            />
          </div>

          <button type="submit" className="send-button" disabled={isSendingOTP}>
            <MdSend className="button-icon" />
            {isSendingOTP ? 'Mengirim...' : 'Kirim OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
