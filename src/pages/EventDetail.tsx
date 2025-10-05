import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import EventRegistration from '../components/EventRegistration';
import RegistrationSuccess from '../components/RegistrationSuccess';
import { useAuthStore } from '../stores/authStore';
import { useCart } from '../contexts/CartContext';
import { useEventById, useEventRegister } from '../api/hooks/index';
import { extractIdFromParam } from '../api/codeMapping';
import Swal from 'sweetalert2';
import './EventDetail.css';

interface RegistrationData {
  transid: number;
  ordercode: string;
  invoice_url: string;
}

const EventDetail: React.FC = () => {
  const { eventId: eventParam } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, token, validateToken, requireAuth } = useAuthStore();
  const { cartCount } = useCart();
  
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [isAuthValidated, setIsAuthValidated] = useState(false);
  const [triggerRegistration, setTriggerRegistration] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  // Extract actual event ID from URL parameter (handles both old ID format and new SEO format)
  const eventId = eventParam ? extractIdFromParam(eventParam) : null;
  
  const eventByIdQuery = useEventById(eventId || '');
  const eventRegisterQuery = useEventRegister(triggerRegistration && eventId ? eventId : '');
  
  const eventContent = eventByIdQuery.data?.content;

  // Handle event registration results
  useEffect(() => {
    if (eventRegisterQuery.data && triggerRegistration) {
      const result = eventRegisterQuery.data;
      console.log('🎫 Event Registration Response:', result);

      if (result.status === 200 && result.content) {
        setRegistrationData({
          transid: result.content.transid,
          ordercode: result.content.ordercode,
          invoice_url: result.content.invoice_url,
        });
        setShowRegistrationModal(true);

        Swal.fire({
          icon: 'success',
          title: '🎉 Registration Successful!',
          text: 'Your event registration has been completed successfully.',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Continue',
        });
      } else {
        const errorMsg = result.message || result.error || 'Registration failed. Please try again.';
        Swal.fire({
          icon: 'error',
          title: '❌ Registration Failed',
          text: errorMsg,
          confirmButtonColor: '#ef4444',
        });
      }
      setTriggerRegistration(false);
    }

    if (eventRegisterQuery.error && triggerRegistration) {
      console.error('❌ Event Registration Error:', eventRegisterQuery.error);
      
      // Safely extract error message from Axios error or fallback to generic message
      let errorMessage = 'An unexpected error occurred during registration.';
      if (eventRegisterQuery.error && typeof eventRegisterQuery.error === 'object' && 'response' in eventRegisterQuery.error) {
        const axiosError = eventRegisterQuery.error as any;
        errorMessage = axiosError.response?.data?.error || axiosError.message || errorMessage;
        console.log(errorMessage)
      } else if (eventRegisterQuery.error.message) {
        errorMessage = eventRegisterQuery.error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: '❌ Registration Failed',
        text: errorMessage,
        confirmButtonColor: '#ef4444',
      });
      setTriggerRegistration(false);
    }
  }, [eventRegisterQuery.data, eventRegisterQuery.error, triggerRegistration]);

  // Validate authentication on component mount and when auth state changes
  useEffect(() => {
    const validateAuth = async () => {
      if (isAuthenticated && token) {
        // Validate token format and presence
        const isValidToken = validateToken();
        if (!isValidToken) {
          console.log('❌ Invalid token detected, logging out');
          // Auto logout if token is invalid
          useAuthStore.getState().logout();
          setIsAuthValidated(false);
        } else {
          setIsAuthValidated(true);
          console.log('✅ Authentication validated for event registration');
        }
      } else {
        setIsAuthValidated(false);
      }
    };

    validateAuth();
  }, [isAuthenticated, token, validateToken]);

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  // Helper function to ensure URL has https protocol
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleEventRegister = async () => {
    // Enhanced authentication check
    const authSuccess = requireAuth(() => {}, 'register for event');
    if (!authSuccess || !isAuthValidated) {
      Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'Please login first to register for this event.',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    if (!eventId) {
      Swal.fire({
        icon: 'error',
        title: 'Event Not Found',
        text: 'Event not found or invalid event code.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    // Validate event ID format
    if (!eventId.match(/^\d+$/)) {
      console.error('❌ Invalid event ID format:', eventId);
      Swal.fire({
        icon: 'error',
        title: 'Invalid Event ID',
        text: 'Event ID format is invalid.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    console.log('🎫 Starting event registration for eventId:', eventId);
    console.log('🔐 Using token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    // Trigger the registration query
    setTriggerRegistration(true);
  };

  const handleOpenInvoice = () => {
    if (registrationData?.invoice_url) {
      const fullUrl = getFullUrl(registrationData.invoice_url);
      window.open(fullUrl, '_blank');
    }
  };

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
  };

  const handleMerchantRegistration = () => {
    console.log('🏪 Merchant Registration clicked for event:', eventId);
    if (eventId) {
      navigate(`/merchant-registration/${eventId}`);
    } else {
      console.error('❌ No event ID available for merchant registration');
    }
  };

  const handlePublicRegistration = () => {
    console.log('👤 Public Registration clicked for event:', eventId);
    if (eventId) {
      navigate(`/public-registration/${eventId}`);
    } else {
      console.error('❌ No event ID available for public registration');
    }
  };

  if (eventByIdQuery.isLoading) {
    return (
      <div className="event-detail-page">
        <AppbarDefault
          title="Detail Event"
          onBack={handleBackClick}
          onCartClick={handleCartClick}
          cartCount={cartCount}
          defaultBack="/event"
        />
        <div className="event-detail-loading">
          <p>Memuat detail event...</p>
        </div>
      </div>
    );
  }

  if (!eventContent) {
    return (
      <div className="event-detail-page">
        <AppbarDefault
          title="Detail Event"
          onBack={handleBackClick}
          onCartClick={handleCartClick}
          cartCount={cartCount}
          defaultBack="/event"
        />
        <div className="event-detail-loading">
          <p>Data event tidak tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <AppbarDefault
        title="Detail Event"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
        defaultBack="/event"
      />
      
      <div className="event-detail-content">
        <img
          src={eventContent.image}
          alt={eventContent.name}
          className="event-detail-image"
        />
        
        <div className="event-detail-body">
          <h3 className="event-detail-title">
            {eventContent.code} - {eventContent.name}
          </h3>
          
          <div className="event-detail-info">
            <div className="event-detail-column">
              <div className="event-info-item">
                <b>Tanggal Event:</b>
                <br />
                {eventContent.dates} - {eventContent.time}
              </div>
              <div className="event-info-item">
                <b>Chapter:</b>
                <br />
                {eventContent.chapter}
              </div>
              <div className="event-info-item">
                <b>Tipe:</b>
                <br />
                {eventContent.type_desc}
              </div>
              <div className="event-info-item">
                <b>Deskripsi:</b>
                <br />
                {eventContent.desc}
              </div>
            </div>
            
            <div className="event-detail-column">
              <div className="event-info-item">
                <b>Minimal Peserta:</b>
                <br />
                {eventContent.minimum_participants}
              </div>
              <div className="event-info-item">
                <b>Biaya Kontribusi:</b>
                <br />
                {eventContent.fee}
              </div>
              <div className="event-info-item">
                <b>Status:</b>
                <br />
                {eventContent.done_desc}
              </div>
            </div>
          </div>

          <EventRegistration
            isAuthenticated={isAuthenticated && isAuthValidated}
            isPending={eventRegisterQuery.isFetching && triggerRegistration}
            onRegister={handleEventRegister}
          />

          {showRegistrationModal && registrationData && (
            <div className="modal-overlay" onClick={handleCloseRegistrationModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="modal-close-btn"
                  onClick={handleCloseRegistrationModal}
                  aria-label="Close modal"
                >
                  ×
                </button>
                <RegistrationSuccess
                  registrationData={registrationData}
                  onOpenInvoice={handleOpenInvoice}
                />
              </div>
            </div>
          )}

          {(eventContent.allow_merchant === 1 || eventContent.allow_public === 1) && (
            <div className="registration-navigation">
              <div className="registration-buttons">
                {eventContent.allow_merchant === 1 && (
                  <button
                    onClick={handleMerchantRegistration}
                    className="registration-nav-button merchant"
                  >
                    <div className="nav-button-content">
                      <span className="nav-button-icon">🏪</span>
                      <span>Registrasi Merchant</span>
                    </div>
                  </button>
                )}

                {eventContent.allow_public === 1 && (
                  <button
                    onClick={handlePublicRegistration}
                    className="registration-nav-button public"
                  >
                    <div className="nav-button-content">
                      <span className="nav-button-icon">👤</span>
                      <span>Registrasi Umum</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;