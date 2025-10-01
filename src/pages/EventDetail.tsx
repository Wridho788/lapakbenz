import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import EventRegistration from '../components/EventRegistration';
import RegistrationSuccess from '../components/RegistrationSuccess';
import { useAuthStore } from '../stores/authStore';
import { useCart } from '../contexts/CartContext';
import { useEventById, useEventRegister } from '../api/hooks';
import Swal from 'sweetalert2';
import './EventDetail.css';

interface RegistrationData {
  transid: number;
  ordercode: string;
  invoice_url: string;
}

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cartCount } = useCart();
  
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  
  const eventByIdQuery = useEventById(eventId || '');
  const eventRegisterMutation = useEventRegister();
  
  const eventContent = eventByIdQuery.data?.content;

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
    if (!eventId) {
      Swal.fire({
        icon: 'error',
        title: 'Event ID Missing',
        text: 'Please select an event first.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    try {
      console.log('🎫 Starting event registration for:', eventId);

      const result = await eventRegisterMutation.mutateAsync({
        eventId: eventId,
      });

      console.log('🎫 Event Registration Response:', result);

      if (result.status === 200 && result.content) {
        setRegistrationData({
          transid: result.content.transid,
          ordercode: result.content.ordercode,
          invoice_url: result.content.invoice_url,
        });

        Swal.fire({
          icon: 'success',
          title: '🎉 Registration Successful!',
          text: 'Your event registration has been completed successfully.',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Continue',
        });
      } else {
        const errorMsg = result.message || result.error || 'Registration failed. Please try again.';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Event Registration Failed:', error);
      
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message ||
        error.message || 
        'Event registration failed. Please try again.';
      
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage,
        confirmButtonColor: '#3b82f6',
        footer: 'Please check your information and try again.',
      });
    }
  };

  const handleOpenInvoice = () => {
    if (registrationData?.invoice_url) {
      const fullUrl = getFullUrl(registrationData.invoice_url);
      window.open(fullUrl, '_blank');
    }
  };

  const handleMerchantRegistration = () => {
    console.log('🏪 Merchant Registration clicked for event:', eventId);
    if (eventId) {
      navigate(`/merchant-registration/${eventId}`);
    } else {
      console.error('❌ No event ID selected for merchant registration');
    }
  };

  const handlePublicRegistration = () => {
    console.log('👤 Public Registration clicked for event:', eventId);
    if (eventId) {
      navigate(`/public-registration/${eventId}`);
    } else {
      console.error('❌ No event ID selected for public registration');
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
            isAuthenticated={isAuthenticated}
            isPending={eventRegisterMutation.isPending}
            onRegister={handleEventRegister}
          />

          {registrationData && (
            <RegistrationSuccess
              registrationData={registrationData}
              onOpenInvoice={handleOpenInvoice}
            />
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