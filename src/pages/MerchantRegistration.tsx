import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppbarDefault } from '../components/AppbarDefault';
import { useMerchantRegistration } from '../api/hooks';
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
    qty: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const merchantRegistration = useMerchantRegistration();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      newErrors.name = 'Business name is required';
    }
    if (!formData.cp.trim()) {
      newErrors.cp = 'Contact person is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.menu.trim()) {
      newErrors.menu = 'Menu description is required';
    }
    if (!formData.qty.trim()) {
      newErrors.qty = 'Quantity is required';
    } else if (isNaN(Number(formData.qty)) || Number(formData.qty) <= 0) {
      newErrors.qty = 'Please enter a valid quantity';
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
        title: 'Event ID Missing',
        text: 'Event ID is missing. Please try again from the event page.',
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
      
      if (result.success || result.status === 200) {
        Swal.fire({
          icon: 'success',
          title: '🎉 Registration Successful!',
          text: 'Your merchant registration has been submitted successfully.',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Continue'
        }).then(() => {
          navigate('/event');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: result.message || 'Registration failed. Please try again.',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error.response.data.error);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.error || 'Registration failed. Please try again.',
        confirmButtonColor: '#3b82f6',
        footer: 'Please check your information and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="merchant-registration-page">
      <AppbarDefault 
        title="Merchant Registration" 
        onBack={handleBackClick} 
      />
      
      <div className="merchant-registration-content">
        <div className="registration-header">
          <h2>🏪 Register as Merchant</h2>
          <p>Fill in the details below to register your business for this event</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Business Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your business name"
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
              placeholder="Enter contact person name"
              className={errors.cp ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.cp && <span className="error-text">{errors.cp}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your business address"
              rows={3}
              className={errors.address ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className={errors.phone ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className={errors.email ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="menu">Menu Description *</label>
            <textarea
              id="menu"
              name="menu"
              value={formData.menu}
              onChange={handleInputChange}
              placeholder="Describe your menu items (e.g., BAKSO REBUS, BAKAR, AYAM)"
              rows={3}
              className={errors.menu ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.menu && <span className="error-text">{errors.menu}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="qty">Expected Quantity *</label>
            <input
              type="number"
              id="qty"
              name="qty"
              value={formData.qty}
              onChange={handleInputChange}
              placeholder="Enter expected quantity"
              min="1"
              className={errors.qty ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.qty && <span className="error-text">{errors.qty}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleBackClick}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Registering...
                </>
              ) : (
                '🏪 Register Merchant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantRegistration;