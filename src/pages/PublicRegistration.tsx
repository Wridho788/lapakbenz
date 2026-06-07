import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppbarDefault } from '../components/AppbarDefault';
import { usePublicRegistration } from '../api/hooks/index';
import './PublicRegistration.css';

const PublicRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    policeno: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  const publicRegistration = usePublicRegistration();

  // Updated vehicle types - only motorcycle and car
  const vehicleTypes = [
    { value: '', label: 'Pilih Jenis Kendaraan' },
    { value: 'moto', label: '🏍️ Motor' },
    { value: 'car', label: '🚗 Mobil' }
  ];



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
    }
    if (!formData.type.trim()) {
      newErrors.type = 'Jenis kendaraan wajib dipilih';
    }
    if (!formData.policeno.trim()) {
      newErrors.policeno = 'Nomor polisi wajib diisi';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Masukkan email yang valid';
    }

    // Validation: Phone number and police number cannot be the same
    if (formData.phone.trim() && formData.policeno.trim() && 
        formData.phone.trim() === formData.policeno.trim()) {
      newErrors.phone = 'Nomor telepon tidak boleh sama dengan nomor polisi';
      newErrors.policeno = 'Nomor polisi tidak boleh sama dengan nomor telepon';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(`/event/${eventId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    const loadingToast = toast.loading('Mengirim pendaftaran...', {
      position: 'bottom-right',
      theme: 'dark',
    });

    if (!validateForm()) {
      toast.dismiss(loadingToast);
      toast.error('Mohon lengkapi semua field yang wajib diisi', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      setIsSubmitting(false);
      return;
    }

    if (!eventId) {
      toast.dismiss(loadingToast);
      toast.error('ID event tidak ditemukan. Silakan coba lagi dari halaman event.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        eventid: eventId,
        name: formData.name,
        type: formData.type,
        policeno: formData.policeno,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
      };

      const result = await publicRegistration.mutateAsync(payload);
      // console.log('Registration Result:', result);
      toast.dismiss(loadingToast);
      // Check if registration was successful
      if (result.status === 200) {
        setRegistrationResult(result);
        setShowSuccessModal(true);
        
        toast.success('🎉 Pendaftaran berhasil!', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
      } else {
        toast.error(result.message || 'Pendaftaran gagal. Silakan coba lagi.', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Registration Error:', error);

      // Try multiple error message sources
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Pendaftaran gagal. Silakan periksa data Anda dan coba lagi.';

      toast.error(errorMessage, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    // Back to event detail
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="public-registration-page">
      <AppbarDefault 
        title="Pendaftaran Umum" 
        onBack={handleBackClick} 
      />
      
      <div className="public-registration-content">
        <div className="registration-header">
          <h2>👤 Pendaftaran Umum</h2>
          <p>Isi data berikut untuk mendaftar pada event ini</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama lengkap Anda"
              className={errors.name ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Jenis Kendaraan *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={errors.type ? 'error' : ''}
              disabled={isSubmitting}
            >
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>

          {/* <div className="form-group">
            <label htmlFor="tenantCount">Jumlah Tenant *</label>
            <select
              id="tenantCount"
              name="tenantCount"
              value={formData.tenantCount}
              onChange={handleInputChange}
              className={errors.tenantCount ? 'error' : ''}
              disabled={isSubmitting}
            > */}
              {/* {tenantCountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))} */}
            {/* </select> */}
            {/* {errors.tenantCount && <span className="error-text">{errors.tenantCount}</span>} */}
          {/* </div> */}

          <div className="form-group">
            <label htmlFor="policeno">Nomor Polisi *</label>
            <input
              type="text"
              id="policeno"
              name="policeno"
              value={formData.policeno}
              onChange={handleInputChange}
              placeholder="Masukkan nomor polisi kendaraan"
              className={errors.policeno ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.policeno && <span className="error-text">{errors.policeno}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">No. Telepon *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Masukkan nomor telepon"
              className={errors.phone ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Masukkan alamat email"
              className={errors.email ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Catatan Tambahan</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Catatan tambahan atau kebutuhan khusus (opsional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleBackClick}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Mendaftarkan...
                </>
              ) : (
                '👤 Daftar Sekarang'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && registrationResult && (
        <div className="success-modal-overlay" onClick={handleCloseSuccessModal}>
          <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Animated Success Icon */}
            <div className="success-icon-wrapper">
              <div className="success-icon-ring"></div>
              <div className="success-icon-ring delay-1"></div>
              <div className="success-icon-ring delay-2"></div>
              <div className="success-checkmark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="success-header">
              <h2>Pendaftaran Berhasil!</h2>
              <p>Terima kasih telah mendaftar. Data Anda telah kami terima.</p>
            </div>

            {/* Registration Details Card */}
            <div className="success-details-card">
              <div className="success-detail-header">
                <span className="detail-icon">📋</span>
                <span>Detail Pendaftaran</span>
              </div>
              <div className="success-detail-list">
                <div className="success-detail-item">
                  <span className="detail-label">Nama</span>
                  <span className="detail-value">{formData.name}</span>
                </div>
                <div className="success-detail-item">
                  <span className="detail-label">Kendaraan</span>
                  <span className="detail-value">{formData.type === 'moto' ? '🏍️ Motor' : '🚗 Mobil'}</span>
                </div>
                <div className="success-detail-item">
                  <span className="detail-label">No. Polisi</span>
                  <span className="detail-value">{formData.policeno}</span>
                </div>
                <div className="success-detail-item">
                  <span className="detail-label">Kontak</span>
                  <span className="detail-value">{formData.phone}</span>
                </div>
              </div>

            </div>

            {/* Info Message */}
            <div className="success-info-message">
              <span className="info-icon">💬</span>
              <p>Anda akan menerima notifikasi terkait event ini melalui email dan nomor telepon yang telah didaftarkan.</p>
            </div>

            {/* Action Button */}
            <div className="success-actions">
              <button
                type="button"
                onClick={handleCloseSuccessModal}
                className="btn-success-action"
              >
                Lihat Detail Event
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRegistration;