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
    { value: '', label: 'Select Vehicle Type' },
    { value: 'car', label: '🚗 Car' },
    { value: 'motorcycle', label: '🏍️ Motorcycle' },
    { value: 'truck', label: '🚛 Truck' },
    { value: 'van', label: '🚐 Van' },
    { value: 'bus', label: '🚌 Bus' },
    { value: 'other', label: '🚙 Other' }
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
      newErrors.name = 'Full name is required';
    }
    if (!formData.type.trim()) {
      newErrors.type = 'Vehicle type is required';
    }
    if (!formData.policeno.trim()) {
      newErrors.policeno = 'Police number is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Validation: Phone number and police number cannot be the same
    if (formData.phone.trim() && formData.policeno.trim() && 
        formData.phone.trim() === formData.policeno.trim()) {
      newErrors.phone = 'Phone number cannot be the same as police number';
      newErrors.policeno = 'Police number cannot be the same as phone number';
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

      const result = await publicRegistration.mutateAsync(payload);
      
      console.log('✅ Public Registration Success:', result);
      
      // Check if registration was successful based on status code and content presence
      if (result.status === 200 && result.content) {
        const hasInvoice = result.content.invoice_url;
        const invoiceUrl = result.content.invoice_url;
        
        Swal.fire({
          icon: 'success',
          title: '🎉 Registration Successful!',
          html: `
            <p>Your public registration has been submitted successfully.</p>
            <br>
            <div style="text-align: left; background: #f8f9fa; padding: 16px; border-radius: 8px; margin-top: 16px;">
              <p><strong>📋 Registration Details:</strong></p>
              <p><strong>Order Code:</strong> ${result.content.ordercode || 'N/A'}</p>
              <p><strong>Transaction ID:</strong> ${result.content.transid || 'N/A'}</p>
              ${hasInvoice ? `<p><strong>Payment URL:</strong> Available</p>` : ''}
            </div>
          `,
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Continue',
          showDenyButton: hasInvoice,
          denyButtonText: hasInvoice ? '💳 View Invoice' : undefined,
          denyButtonColor: '#3b82f6'
        }).then((swalResult) => {
          if (swalResult.isDenied && invoiceUrl) {
            // Open invoice in new tab using Invoice page pattern
            const fullUrl = getFullUrl(invoiceUrl);
            window.open(fullUrl, '_blank');
          }
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
      console.error('❌ Registration failed:', error);
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
    <div className="public-registration-page">
      <AppbarDefault 
        title="Public Registration" 
        onBack={handleBackClick} 
      />
      
      <div className="public-registration-content">
        <div className="registration-header">
          <h2>👤 Public Registration</h2>
          <p>Fill in the details below to register for this event</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Vehicle Type *</label>
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
            <label htmlFor="policeno">Police Number *</label>
            <input
              type="text"
              id="policeno"
              name="policeno"
              value={formData.policeno}
              onChange={handleInputChange}
              placeholder="Enter your vehicle police number"
              className={errors.policeno ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.policeno && <span className="error-text">{errors.policeno}</span>}
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
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes or special requirements (optional)"
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
                '👤 Register Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicRegistration;