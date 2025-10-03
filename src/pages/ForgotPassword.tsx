import React, { useState } from 'react';
import Swal from 'sweetalert2';
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
      Swal.fire({ icon: 'warning', title: 'Input diperlukan', text: 'Masukkan email atau nomor HP Anda', confirmButtonColor: '#3b82f6' });
      return;
    }
    requestOTP(
      { username: emailOrPhone.trim() },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          Swal.fire({ icon: 'success', title: 'OTP dikirim', text: 'Kode OTP telah dikirim ke email/nomor HP Anda.', timer: 1500, showConfirmButton: false });
        },
        onError: (err: any) => {
          let msg = 'Gagal mengirim OTP.';
          if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
            msg = err.message;
          }
          Swal.fire({ icon: 'error', title: 'Gagal', text: msg, confirmButtonColor: '#d33' });
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
      Swal.fire({ icon: 'warning', title: 'Input diperlukan', text: 'OTP dan password baru wajib diisi', confirmButtonColor: '#3b82f6' });
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
          Swal.fire({ icon: 'success', title: 'Password berhasil diubah', text: 'Silakan login dengan password baru Anda.', confirmButtonColor: '#10b981' })
            .then(() => navigate('/login'));
        },
        onError: (err: any) => {
          let msg = 'Gagal mengubah password.';
          if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
            msg = err.message;
          }
          Swal.fire({ icon: 'error', title: 'Gagal', text: msg, confirmButtonColor: '#d33' });
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
