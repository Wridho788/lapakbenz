import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import EventRegistration from '../components/EventRegistration';
import SEO from '../components/SEO';
import { generateBreadcrumbs, formatDateForSchema, truncateText, stripHtml, formatPrice } from '../utils/seoUtils';
import { useAuthStore } from '../stores/authStore';
import { useCart } from '../contexts/CartContext';
import { useEventById, useEventRegister } from '../api/hooks/index';
import { extractIdFromParam } from '../api/codeMapping';
import type { EventItem } from '../api/types/eventTypes';
import { toast } from 'react-toastify';
import './EventDetail.css';

const EventDetail: React.FC = () => {
  const { eventId: eventParam } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, token, validateToken, requireAuth } = useAuthStore();
  const { cartCount } = useCart();

  const [isAuthValidated, setIsAuthValidated] = useState(false);
  const [triggerRegistration, setTriggerRegistration] = useState(false);

  const eventId = eventParam ? extractIdFromParam(eventParam) : null;

  const eventByIdQuery = useEventById(eventId || '');
  const eventRegisterQuery = useEventRegister(eventId || '', token);

  const eventData = eventByIdQuery.data?.result as EventItem | undefined;
  const imageUrl = eventByIdQuery.data?.image_url || '';

  useEffect(() => {
    if (eventRegisterQuery.data && triggerRegistration) {
      const result = eventRegisterQuery.data;
      if (result.status === 200) {
        toast.success('Registration Successful! Your event registration has been completed successfully.', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
      } else {
        const errorMsg = result.message || result.error || 'Registration failed. Please try again.';
        if (errorMsg.toLowerCase().includes('already done') || errorMsg.toLowerCase().includes('already')) {
          toast.error('Register Failed: Event Already Done', {
            position: 'bottom-right',
            autoClose: 2000,
            theme: 'dark',
          });
        } else {
          toast.error(`Registration Failed: ${errorMsg}`, {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
        }
      }
      setTriggerRegistration(false);
    }

    if (eventRegisterQuery.error && triggerRegistration) {
      let errorMessage = 'An unexpected error occurred during registration.';
      if (eventRegisterQuery.error && typeof eventRegisterQuery.error === 'object' && 'response' in eventRegisterQuery.error) {
        const axiosError = eventRegisterQuery.error as { response?: { data?: { error?: string } }; message?: string };
        errorMessage = axiosError.response?.data?.error || axiosError.message || errorMessage;
      } else if (eventRegisterQuery.error.message) {
        errorMessage = eventRegisterQuery.error.message;
      }

      if (errorMessage.toLowerCase().includes('already done') || errorMessage.toLowerCase().includes('already')) {
        toast.error('Register Failed: Event Already Done', {
          position: 'bottom-right',
          autoClose: 2000,
          theme: 'dark',
        });
      } else {
        toast.error(`Registration Failed: ${errorMessage}`, {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
      }
      setTriggerRegistration(false);
    }
  }, [eventRegisterQuery.data, eventRegisterQuery.error, triggerRegistration]);

  useEffect(() => {
    const validateAuth = async () => {
      if (isAuthenticated && token) {
        const isValidToken = validateToken();
        if (!isValidToken) {
          useAuthStore.getState().logout();
          setIsAuthValidated(false);
        } else {
          setIsAuthValidated(true);
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
    navigate('/cart', { state: { from: `/event-detail/${eventParam || ''}` } });
  };

  const handleEventRegister = async () => {
    const authSuccess = requireAuth(() => {}, 'register for event');
    if (!authSuccess || !isAuthValidated) {
      toast.warning('Please login first to register for this event.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    if (!eventId) {
      toast.error('Event not found or invalid event code.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    if (!eventId.match(/^\d+$/)) {
      toast.error('Event ID format is invalid.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }
    setTriggerRegistration(true);
  };

  const handleMerchantRegistration = () => {
    if (eventId) {
      navigate(`/merchant-registration/${eventId}`);
    }
  };

  const handlePublicRegistration = () => {
    if (eventId) {
      navigate(`/public-registration/${eventId}`);
    }
  };

  const getImageSrc = (imagePath?: string) => {
    if (!imagePath) return '/lapakbenz.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${imageUrl}${imagePath}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeLabel = (type?: number) => {
    const labels: Record<number, string> = { 0: 'PRIVATE', 1: 'COMBINATED' };
    return labels[type ?? 0] || 'UNKNOWN';
  };

  const getStatusLabel = (done?: number) => {
    return done === 1 ? 'Selesai' : 'Akan Datang';
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

  if (!eventData) {
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
      <SEO
        title={`${eventData.Name} • ${eventData.Dates} - ${getTypeLabel(eventData.Type)} | LapakBenz - Platform Komunitas & Event Indonesia`}
        description={truncateText(stripHtml(eventData.Desc || ''), 155) + ` Event pada ${eventData.Dates}. ${(eventData.Fee || 0) > 0 ? `Biaya kontribusi: ${formatPrice(eventData.Fee || 0)}` : 'Gratis'}. Daftar sekarang di lapakBenz!`}
        keywords={`${(eventData.Name || '').toLowerCase()}, event lapakbenz, event komunitas indonesia, ${eventData.Dates}`}
        image={getImageSrc(eventData.Image)}
        schemaType="Event"
        publishedTime={formatDateForSchema(eventData.Dates)}
        section="Event"
        tags={['Event', 'Komunitas']}
        breadcrumbs={generateBreadcrumbs('event', eventData.Name || '')}
      />
      <AppbarDefault
        title="Detail Event"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
        defaultBack="/event"
      />

      <div className="event-detail-content">
        <img
          src={getImageSrc(eventData.Image)}
          alt={eventData.Name}
          className="event-detail-image"
        />

        <div className="event-detail-body">
          <h3 className="event-detail-title">
            {eventData.Name}
          </h3>

          <div className="event-detail-info">
            <div className="event-detail-column">
              <div className="event-info-item">
                <b>Tanggal Event:</b>
                <br />
                {formatDate(eventData.Dates)}
              </div>
              <div className="event-info-item">
                <b>Tipe:</b>
                <br />
                {getTypeLabel(eventData.Type)}
              </div>
              <div className="event-info-item">
                <b>Deskripsi:</b>
                <br />
                {eventData.Desc}
              </div>
            </div>

            <div className="event-detail-column">
              <div className="event-info-item">
                <b>Minimal Peserta:</b>
                <br />
                {eventData.MinimumParticipant}
              </div>
              <div className="event-info-item">
                <b>Biaya Kontribusi:</b>
                <br />
                {eventData.Fee === 0 ? 'Gratis' : formatPrice(eventData.Fee || 0)}
              </div>
              <div className="event-info-item">
                <b>Status:</b>
                <br />
                {getStatusLabel(eventData.Done)}
              </div>
            </div>
          </div>

          <EventRegistration
            isAuthenticated={isAuthenticated && isAuthValidated}
            isPending={eventRegisterQuery.isFetching && triggerRegistration}
            onRegister={handleEventRegister}
          />

          {(eventData.AllowMerchant === 1 || eventData.AllowPublic === 1) && (
            <div className="registration-navigation">
              <div className="registration-buttons">
                {eventData.AllowMerchant === 1 && (
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

                {eventData.AllowPublic === 1 && (
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