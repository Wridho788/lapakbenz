import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppbarDefault } from '../components/AppbarDefault';
import './VerifyOtp.css';
import { useSimpleRequestOTP, useVerifyOTP } from '../api/hooks/index';

const OTP_LENGTH = 4;
const OTP_EXPIRE_SECONDS = 120;

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(OTP_EXPIRE_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const hasRequestedOTP = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil username dari state (tphone1), pastikan string
  const username =
    typeof location.state === 'object' &&
    location.state &&
    typeof (location.state as any).username === 'string'
      ? (location.state as any).username.trim()
      : '';

  // Panggil hooks OTP
  const verifyOTPMutation = useVerifyOTP();

  const { requestOTP, canRequest } = useSimpleRequestOTP(username, {
    onSuccess: () => {
      toast.success('OTP dikirim', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      setTimer(OTP_EXPIRE_SECONDS);
      setIsExpired(false);
    },
    onError: (err) => {
      let msg = 'Terjadi kesalahan saat mengirim OTP. Silakan coba lagi.';
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        msg = err.message;
      }
      toast.error(msg, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    },
  });

  // Request OTP saat pertama kali masuk halaman ATAU saat user kembali setelah timeout
  useEffect(() => {
    if (!username) {
      toast.error('Username tidak valid. Silakan kembali dan coba lagi.', {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'dark',
      });
      setTimeout(() => navigate(-1), 2000);
      return;
    }

    if (canRequest) {
      // Jika user kembali dari timeout, request OTP baru secara otomatis
      requestOTP();
      hasRequestedOTP.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]); // Re-run when location state changes (user returning after timeout)

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setOtp(value);
    if (error) setError('');
    if (isExpired) setIsExpired(false);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleResend = () => {
    if (!canRequest) {
      toast.error('Username tidak valid, tidak dapat mengirim OTP.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    setResendDisabled(true);
    setResendCount((c) => c + 1);
    setTimer(OTP_EXPIRE_SECONDS);
    setIsExpired(false);
    setOtp('');
    setError('');
    requestOTP();
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
    if (!username) {
      setError('Username tidak ditemukan');
      return;
    }
    if (isExpired) {
      setError('Kode OTP sudah kadaluarsa. Silakan kirim ulang.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Panggil API verify OTP
      await verifyOTPMutation.mutateAsync({
        otp: parseInt(otp.trim()),
        username: username,
      });

      // Tampilkan success message
      toast.success('Kode OTP Anda telah diverifikasi!', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      setTimeout(() => {
        // Navigate ke halaman login atau halaman berikutnya
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      console.error('❌ OTP Verification Error:', err);

      let errorMessage = 'Verifikasi OTP gagal. Silakan coba lagi.';

      const data = err?.response?.data;
      const status = err?.response?.status;

      if (typeof data === 'object' && data !== null) {
        // Try to extract meaningful message from various possible response formats
        errorMessage =
          data.error ||
          data.message ||
          data.msg ||
          data.result?.message ||
          data.result?.error ||
          data.result?.msg ||
          JSON.stringify(data);
      } else if (err?.message && !err.message.includes('Username')) {
        errorMessage = err.message;
      }

      // Handle specific status codes with clear user messages
      if (status === 403) {
        // Preserve the actual server error message for 403
      } else if (status === 400) {
        errorMessage = 'Kode OTP tidak valid. Pastikan kode yang Anda masukkan benar.';
      } else if (status === 404) {
        errorMessage = 'Kode OTP tidak ditemukan. Pastikan kode yang Anda masukkan benar.';
      } else if (status === 410) {
        errorMessage = 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.';
      } else if (status === 429) {
        errorMessage = 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.';
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'dark',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <AppbarDefault title="Verifikasi OTP" onBack={handleBackClick} />
      <div className="verify-otp-page">
        <div className="verify-otp-container">
          <h2>Verifikasi Kode OTP</h2>
          <p>Masukkan 4 digit kode OTP yang telah dikirim ke {username}</p>

          <form onSubmit={handleSubmit} className="verify-otp-form">
            <input
              type="text"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={handleChange}
              placeholder="____"
              className={error || isExpired ? 'otp-input otp-error' : 'otp-input'}
              disabled={isSubmitting}
              autoFocus
              inputMode="numeric"
            />
            {error && <div className="otp-error-text">{error}</div>}
            {isExpired && !error && (
              <div className="otp-expired-text">
                Kode OTP sudah kadaluarsa. Silakan kirim ulang.
              </div>
            )}
            {!isExpired && timer > 0 && (
              <div className="otp-timer-text">
                Kode berlaku selama: <strong>{formatTime(timer)}</strong>
              </div>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || isExpired || !otp || otp.length !== OTP_LENGTH}
            >
              {isSubmitting ? <span className="otp-spinner"></span> : 'Verifikasi'}
            </button>
          </form>
          <div className="resend-section">
            <div className="resend-label">Tidak mendapatkan kode OTP?</div>
            <button
              type="button"
              className="btn-link resend-otp-btn"
              onClick={handleResend}
              disabled={resendDisabled}
            >
              Kirim ulang OTP {resendCount > 0 && `(percobaan ${resendCount + 1})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
