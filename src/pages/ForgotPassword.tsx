import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRequestOTP, useForgotPassword } from '../api/hooks/index';
import { useNavigate } from 'react-router-dom';
import { MdSend, MdVisibility, MdVisibilityOff } from 'react-icons/md';
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
          const status = err?.response?.status;
          const data = err?.response?.data;

          if (data?.message) {
            msg = data.message;
          } else if (data?.error) {
            msg = data.error;
          } else if (status === 400) {
            msg = 'Format input tidak valid. Masukkan email atau nomor HP yang benar.';
          } else if (status === 403) {
            msg = 'Akun tidak ditemukan.';
          } else if (status === 429) {
            msg = 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.';
          } else if (status === 500) {
            msg = 'Server sedang sibuk. Silakan coba beberapa saat lagi.';
          } else if (err?.message && typeof err.message === 'string' && err.message) {
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
  const [showNewPassword, setShowNewPassword] = useState(false);
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
        otp: parseInt(otp.trim()),
        password: newPassword,
        username: emailOrPhone.trim(),
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
          const status = err?.response?.status;
          const data = err?.response?.data;

          if (data?.message) {
            msg = data.message;
          } else if (data?.error) {
            msg = data.error;
          } else if (status === 400) {
            msg = data?.message || 'Data tidak valid. Pastikan OTP sudah benar.';
          } else if (status === 403) {
            msg = 'OTP tidak valid atau sudah kadaluarsa. Silakan minta OTP baru.';
          } else if (status === 404) {
            msg = 'Akun tidak ditemukan.';
          } else if (status === 410) {
            msg = 'Kode OTP sudah kadaluarsa. Silakan minta OTP baru.';
          } else if (status === 429) {
            msg = 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.';
          } else if (err?.message && typeof err.message === 'string' && err.message) {
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
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Masukkan password baru"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(prev => !prev)}
                  aria-label={showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  tabIndex={-1}
                >
                  {showNewPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
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
