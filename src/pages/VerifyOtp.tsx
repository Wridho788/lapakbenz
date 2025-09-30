import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppbarDefault } from '../components/AppbarDefault';
import './VerifyOtp.css';
import { useSimpleRequestOTP, useVerifyOTP } from '../api/hooks'; // Tambahkan import ini

const OTP_LENGTH = 4;
const OTP_EXPIRE_SECONDS = 120;

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(OTP_EXPIRE_SECONDS);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  // Ambil username dari state (tphone1), pastikan string
  const username =
    typeof location.state === 'object' &&
    location.state &&
    typeof (location.state as any).username === 'string'
      ? (location.state as any).username.trim()
      : '';
  const idCustomer =
    typeof location.state === 'object' &&
    location.state &&
    typeof (location.state as any).id_customer === 'string'
      ? (location.state as any).id_customer.trim()
      : '';

  // Panggil hooks OTP saat masuk halaman
  const verifyOTPMutation = useVerifyOTP();

  const { requestOTP, canRequest } = useSimpleRequestOTP(username, {
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'OTP dikirim', timer: 1200, showConfirmButton: false });
    },
    onError: (err) => {
      let msg = 'Terjadi kesalahan saat mengirim OTP. Silakan coba lagi.';
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        msg = err.message;
      }
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengirim OTP',
        text: msg,
        confirmButtonColor: '#d33',
      });
    },
  });

  React.useEffect(() => {
    if (canRequest) {
      requestOTP();
    }
    // eslint-disable-next-line
  }, [canRequest]);

  React.useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setOtp(value);
    if (error) setError('');
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleResend = () => {
    setResendDisabled(true);
    setResendCount((c) => c + 1);
    setTimer(OTP_EXPIRE_SECONDS);
    setOtp('');
    setError('');
    if (canRequest) {
      requestOTP();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengirim OTP',
        text: 'Username tidak valid, tidak dapat mengirim OTP.',
        confirmButtonColor: '#d33',
      });
    }
    setTimeout(() => setResendDisabled(false), 10000); // 10 detik cooldown
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input
    if (!otp.trim()) {
      setError('Kode OTP wajib diisi');
      return;
    }
    if (!/^[0-9]{4}$/.test(otp)) {
      setError('OTP harus 4 digit angka');
      return;
    }
    if (!idCustomer) {
      setError('ID Customer tidak ditemukan');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Panggil API verify OTP
      const result = await verifyOTPMutation.mutateAsync({
        id_customer: idCustomer,
        otp: otp.trim(),
      });

      console.log('✅ OTP Verification Success:', result);

      // Tampilkan success message
      Swal.fire({
        icon: 'success',
        title: 'Verifikasi Berhasil',
        text: 'Kode OTP Anda telah diverifikasi!',
        confirmButtonColor: '#10b981',
        timer: 2000,
      }).then(() => {
        // Navigate ke halaman login atau halaman berikutnya
        navigate('/login', { replace: true });
      });
    } catch (err: any) {
      console.error('❌ OTP Verification Error:', err);

      // Handle berbagai jenis error
      let errorMessage = 'Verifikasi OTP gagal. Silakan coba lagi.';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Tampilkan error
      setError(errorMessage);

      Swal.fire({
        icon: 'error',
        title: 'Verifikasi Gagal',
        text: errorMessage,
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <AppbarDefault title="Verifikasi OTP" onBack={handleBackClick} />
      <div className="verify-otp-page">
        <div className="verify-otp-container">
          <h2>Verifikasi Kode OTP</h2>
          <p>Masukkan 4 digit kode OTP yang telah dikirim</p>

          <form onSubmit={handleSubmit} className="verify-otp-form">
            <input
              type="text"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={handleChange}
              placeholder="____"
              className={error ? 'otp-input otp-error' : 'otp-input'}
              disabled={isSubmitting || timer <= 0}
              autoFocus
              inputMode="numeric"
            />
            {error && <div className="otp-error-text">{error}</div>}
            <button type="submit" className="btn-primary" disabled={isSubmitting || timer <= 0}>
              {isSubmitting ? <span className="otp-spinner"></span> : 'Verifikasi'}
            </button>
          </form>
          <div
            style={{ marginTop: 20, marginBottom: 4, color: '#666', fontSize: 14, fontWeight: 500 }}
          >
            Tidak mendapatkan kode OTP?
          </div>
          <button
            type="button"
            className="btn-link resend-otp-btn"
            onClick={handleResend}
            disabled={resendDisabled || timer > 0}
            style={{
              marginTop: 0,
              color: resendDisabled || timer > 0 ? '#bbb' : '#3b82f6',
              background: 'none',
              border: 'none',
              cursor: resendDisabled || timer > 0 ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            Kirim ulang OTP {resendCount > 0 && `(percobaan ${resendCount + 1})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
