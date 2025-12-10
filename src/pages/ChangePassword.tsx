import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import './AccountPages.css';
import { useChangePassword } from '../api/hooks/index';
import { toast } from 'react-toastify';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const { mutate: changePassword, isPending } = useChangePassword();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.warning('Password baru dan konfirmasi password tidak sama', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }
    changePassword(
      {
        data: {
          old_pass: formData.currentPassword,
          new_pass: formData.newPassword,
        },
        authToken: '', // token diambil dari useAuthStore di hooks
      },
      {
        onSuccess: () => {
          toast.success('Password berhasil diubah!', {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
          setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: () => {
          toast.error('Gagal mengubah password. Silakan coba lagi.', {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
        },
      }
    );
  };

  return (
    <div className="account-page">
      <AppbarDefault
        title="Ubah Password"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />

      <div className="account-content">
        <div className="account-card">
          <h3>Ubah Password Anda</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Password Lama</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                placeholder="Masukkan password lama"
              />
            </div>
            <div className="form-group">
              <label>Password Baru</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                placeholder="Masukkan password baru"
              />
            </div>
            <div className="form-group">
              <label>Konfirmasi Password Baru</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Ulangi password baru"
              />
            </div>
            <button type="submit" className="save-btn" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </form>
        </div>
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default ChangePassword;
