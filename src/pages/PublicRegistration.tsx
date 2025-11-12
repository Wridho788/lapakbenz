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
    tenantCount: '' // New field for tenant count
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  const publicRegistration = usePublicRegistration();

  // Updated vehicle types - only motorcycle and car
  const vehicleTypes = [
    { value: '', label: 'Pilih Jenis Kendaraan' },
    { value: 'motorcycle', label: '🏍️ Motor' },
    { value: 'car', label: '🚗 Mobil' }
  ];

  // Tenant count options (max 2)
  const tenantCountOptions = [
    { value: '', label: 'Pilih Jumlah Tenant' },
    { value: '1', label: '1 Tenant' },
    { value: '2', label: '2 Tenant' }
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

  // Helper function to ensure URL has https protocol
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    return `https://${url}`;
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
    if (!formData.tenantCount.trim()) {
      newErrors.tenantCount = 'Jumlah tenant wajib dipilih';
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

  const handleViewInvoice = () => {
    if (registrationResult?.content?.invoice_url) {
      const fullUrl = getFullUrl(registrationResult.content.invoice_url);
      window.open(fullUrl, '_blank');
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(`/event/${eventId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon lengkapi semua field yang wajib diisi', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    if (!eventId) {
      toast.error('ID event tidak ditemukan. Silakan coba lagi dari halaman event.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Mengirim pendaftaran...', {
      position: 'bottom-right',
      theme: 'dark',
    });
    
    try {
      const payload = {
        eventid: eventId,
        name: formData.name,
        type: formData.type,
        policeno: formData.policeno,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        tenantCount: formData.tenantCount
      };

      const result = await publicRegistration.mutateAsync(payload);
      
      console.log('✅ Public Registration Success:', result);
      
      toast.dismiss(loadingToast);
      
      // Check if registration was successful
      if (result.status === 200 && result.content) {
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
      console.error('❌ Registration failed:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'Pendaftaran gagal. Silakan periksa data Anda dan coba lagi.', {
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

          <div className="form-group">
            <label htmlFor="tenantCount">Jumlah Tenant *</label>
            <select
              id="tenantCount"
              name="tenantCount"
              value={formData.tenantCount}
              onChange={handleInputChange}
              className={errors.tenantCount ? 'error' : ''}
              disabled={isSubmitting}
            >
              {tenantCountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.tenantCount && <span className="error-text">{errors.tenantCount}</span>}
          </div>

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
        <div className="modal-overlay" onClick={handleCloseSuccessModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎉 Pendaftaran Berhasil!</h2>
            </div>
            <div className="modal-body">
              <p>Pendaftaran Anda berhasil dikirim.</p>
              <div className="registration-details">
                <h3>📋 Detail Pendaftaran:</h3>
                <div className="detail-item">
                  <strong>Kode Order:</strong>
                  <span>{registrationResult.content.ordercode || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <strong>ID Transaksi:</strong>
                  <span>{registrationResult.content.transid || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <strong>Jumlah Tenant:</strong>
                  <span>{formData.tenantCount} Tenant</span>
                </div>
                {!registrationResult.content.invoice_url && (
                  <div className="detail-item free-registration">
                    <strong>Biaya pendaftaran:</strong>
                    <span className="free-badge">GRATIS</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              {registrationResult.content.invoice_url && (
                <button
                  type="button"
                  onClick={handleViewInvoice}
                  className="btn-secondary"
                >
                  💳 Lihat Invoice
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseSuccessModal}
                className="btn-primary"
              >
                {registrationResult.content.invoice_url ? 'Lanjut' : 'Kembali ke Detail Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRegistration;