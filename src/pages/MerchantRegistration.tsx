import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppbarDefault } from '../components/AppbarDefault';
import { useMerchantRegistration } from '../api/hooks/index';
import './MerchantRegistration.css';

const MerchantRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  
  const [formData, setFormData] = useState({
    name: '',
    cp: '',
    address: '',
    phone: '',
    email: '',
    menu: '',
    qty: '1'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const merchantRegistration = useMerchantRegistration();

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
      newErrors.name = 'Nama usaha wajib diisi';
    }
    if (!formData.cp.trim()) {
      newErrors.cp = 'Contact Person wajib diisi';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Alamat wajib diisi';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Masukkan email yang valid';
    }
    if (!formData.menu.trim()) {
      newErrors.menu = 'Deskripsi menu wajib diisi';
    }
    if (!formData.qty) {
      newErrors.qty = 'Jumlah tenant wajib dipilih';
    }

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

      const result = await merchantRegistration.mutateAsync(payload);
      
      console.log('✅ Merchant Registration Success:', result);
      
      // Check if registration was successful based on status code and content presence
      if (result.status === 200 && result.content) {
        const hasInvoice = result.content.invoice_url;
        const invoiceUrl = result.content.invoice_url;
        if (!hasInvoice) {
          await Swal.fire({
            icon: 'success',
            title: '🎉 Pendaftaran Berhasil!',
            html: `
              <p>Pendaftaran merchant Anda berhasil dikirim.</p>
              <br>
              <div style="text-align: left; background: #f8f9fa; padding: 16px; border-radius: 8px; margin-top: 16px;">
                <p><strong>📋 Detail Pendaftaran:</strong></p>
                <p><strong>Kode Order:</strong> ${result.content.ordercode || 'N/A'}</p>
                <p><strong>ID Transaksi:</strong> ${result.content.transid || 'N/A'}</p>
                <p style="color: #10b981; margin-top: 10px;"><strong>Biaya pembuatan merchant: GRATIS</strong></p>
              </div>
            `,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Lanjut',
          });
          // Navigate back to event detail after closing the success modal
          navigate(`/event/${eventId}`);
        } else {
          const swalResult = await Swal.fire({
            icon: 'success',
            title: '🎉 Pendaftaran Berhasil!',
            html: `
              <p>Pendaftaran merchant Anda berhasil dikirim.</p>
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
          });
          
          // Handle button clicks
          if (swalResult.isDenied && invoiceUrl) {
            // Open invoice in new tab using Invoice page pattern
            const fullUrl = getFullUrl(invoiceUrl);
            window.open(fullUrl, '_blank');
          }
          // Navigate back to event detail after modal is closed
          navigate(`/event/${eventId}`);
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
      console.error('❌ Registration failed:', error.response?.data?.error);
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
    // Navigate back to event detail
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="merchant-registration-page">
      <AppbarDefault 
        title="Pendaftaran Merchant" 
        onBack={handleBackClick} 
      />
      
      <div className="merchant-registration-content">
        <div className="registration-header">
          <h2>🏪 Daftar Sebagai Merchant</h2>
          <p>Isi data berikut untuk mendaftarkan usaha Anda pada event ini</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Nama Usaha *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama usaha Anda"
              className={errors.name ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cp">Contact Person *</label>
            <input
              type="text"
              id="cp"
              name="cp"
              value={formData.cp}
              onChange={handleInputChange}
              placeholder="Masukkan nama Contact Person"
              className={errors.cp ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.cp && <span className="error-text">{errors.cp}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Alamat *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Masukkan alamat usaha Anda"
              rows={3}
              className={errors.address ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
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
            <label htmlFor="menu">Deskripsi Menu *</label>
            <textarea
              id="menu"
              name="menu"
              value={formData.menu}
              onChange={handleInputChange}
              placeholder="Deskripsikan menu yang dijual (cth: BAKSO REBUS, BAKAR, AYAM)"
              rows={3}
              className={errors.menu ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.menu && <span className="error-text">{errors.menu}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="qty">Jumlah Tenant *</label>
            <select
              id="qty"
              name="qty"
              value={formData.qty}
              onChange={handleInputChange}
              className={errors.qty ? 'error' : ''}
              disabled={isSubmitting}
            >
              <option value="1">1 Tenant</option>
              <option value="2">2 Tenant</option>
            </select>
            {errors.qty && <span className="error-text">{errors.qty}</span>}
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
                '🏪 Daftar Merchant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantRegistration;