import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppbarDefault } from '../components/AppbarDefault';
import { usePublicRegistration } from '../api/hooks';
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
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const publicRegistration = usePublicRegistration();

  const vehicleTypes = [
    { value: '', label: 'Pilih Jenis Kendaraan' },
    { value: 'car', label: '🚗 Mobil' },
    { value: 'motorcycle', label: '🏍️ Motor' },
    { value: 'truck', label: '🚛 Truk' },
    { value: 'van', label: '🚐 Van' },
    { value: 'bus', label: '🚌 Bus' },
    { value: 'other', label: '🚙 Lainnya' }
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

  // Helper function to ensure URL has https protocol (like Invoice page)
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    
    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If URL doesn't have protocol, add https://
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

    // Validation: Phone number and police number cannot be the same
    if (formData.phone.trim() && formData.policeno.trim() && 
        formData.phone.trim() === formData.policeno.trim()) {
      newErrors.phone = 'Nomor telepon tidak boleh sama dengan nomor polisi';
      newErrors.policeno = 'Nomor polisi tidak boleh sama dengan nomor telepon';
    }

    // Notes is optional, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!eventId) {
      Swal.fire({
        icon: 'error',
        title: 'ID Event Tidak Ada',
        text: 'ID event tidak ditemukan. Silakan coba lagi dari halaman event.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        eventid: eventId,
        ...formData
      };

      const result = await publicRegistration.mutateAsync(payload);
      
      console.log('✅ Public Registration Success:', result);
      
      // Check if registration was successful based on status code and content presence
      if (result.status === 200 && result.content) {
        const hasInvoice = result.content.invoice_url;
        const invoiceUrl = result.content.invoice_url;
        if (!hasInvoice) {
          await Swal.fire({
            icon: 'success',
            title: '🎉 Pendaftaran Berhasil!',
            html: `
              <p>Pendaftaran Anda berhasil dikirim.</p>
              <br>
              <div style="text-align: left; background: #f8f9fa; padding: 16px; border-radius: 8px; margin-top: 16px;">
                <p><strong>📋 Detail Pendaftaran:</strong></p>
                <p><strong>Kode Order:</strong> ${result.content.ordercode || 'N/A'}</p>
                <p><strong>ID Transaksi:</strong> ${result.content.transid || 'N/A'}</p>
                <p style="color: #10b981; margin-top: 10px;"><strong>Biaya pendaftaran: GRATIS</strong></p>
              </div>
            `,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Lanjut',
            willClose: () => {
              if (Swal.getConfirmButton()?.contains(document.activeElement)) {
                navigate('/event');
              }
            }
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: '🎉 Pendaftaran Berhasil!',
            html: `
              <p>Pendaftaran Anda berhasil dikirim.</p>
              <br>
              <div style="text-align: left; background: #f8f9fa; padding: 16px; border-radius: 8px; margin-top: 16px;">
                <p><strong>📋 Detail Pendaftaran:</strong></p>
                <p><strong>Kode Order:</strong> ${result.content.ordercode || 'N/A'}</p>
                <p><strong>ID Transaksi:</strong> ${result.content.transid || 'N/A'}</p>
              </div>
            `,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Lanjut',
            showDenyButton: hasInvoice,
            denyButtonText: hasInvoice ? '💳 Lihat Invoice' : undefined,
            denyButtonColor: '#3b82f6',
            willClose: () => {
              if (Swal.getConfirmButton()?.contains(document.activeElement)) {
                navigate('/event');
              }
            }
          }).then((swalResult) => {
            if (swalResult.isDenied && invoiceUrl) {
              // Open invoice in new tab using Invoice page pattern
              const fullUrl = getFullUrl(invoiceUrl);
              window.open(fullUrl, '_blank');
            }
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Pendaftaran Gagal',
          text: result.message || 'Pendaftaran gagal. Silakan coba lagi.',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Pendaftaran Gagal',
        text: error.response?.data?.error || 'Pendaftaran gagal. Silakan coba lagi.',
        confirmButtonColor: '#3b82f6',
        footer: 'Silakan periksa data Anda dan coba lagi.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
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
    </div>
  );
};

export default PublicRegistration;