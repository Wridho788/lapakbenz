import React, { useState, useEffect, useRef } from 'react';
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
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [isEventNotFound, setIsEventNotFound] = useState(false);
  const registrationInFlightRef = useRef(false);

  const eventId = eventParam ? extractIdFromParam(eventParam) : null;

  const eventByIdQuery = useEventById(eventId || '');
  const eventRegisterQuery = useEventRegister(eventId || '', token);

  const eventData = eventByIdQuery.data?.result as EventItem | undefined;
  const imageUrl = eventByIdQuery.data?.image_url || '';

  useEffect(() => {
    if (registrationInFlightRef.current && eventRegisterQuery.status !== 'pending') {
      const result = eventRegisterQuery.data;
      const error = eventRegisterQuery.error;

      if (result && result.status === 200) {
        toast.success('Registration Successful!', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
        setAlreadyJoined(true);
      } else if (result) {
        const errorMsg = result.message || result.error || 'Registration failed.';
        if (errorMsg.toLowerCase().includes('already')) {
          toast.error('Register Failed: Event Already Done', {
            position: 'bottom-right',
            autoClose: 2000,
            theme: 'dark',
          });
          setAlreadyJoined(true);
        } else if (errorMsg.toLowerCase().includes('not found')) {
          toast.error('Register Failed: Event Not Found', {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
          setIsEventNotFound(true);
        } else {
          toast.error(`Register Failed: ${errorMsg}`, {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
        }
      } else if (error) {
        let errorMessage = 'An unexpected error occurred.';
        if (
          error &&
          typeof error === 'object' &&
          'response' in error
        ) {
          const axiosError = error as {
            response?: { data?: { error?: string } };
            message?: string;
          };
          errorMessage = axiosError.response?.data?.error || axiosError.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        if (errorMessage.toLowerCase().includes('already')) {
          toast.error('Register Failed: Event Already Done', {
            position: 'bottom-right',
            autoClose: 2000,
            theme: 'dark',
          });
          setAlreadyJoined(true);
        } else if (errorMessage.toLowerCase().includes('not found')) {
          toast.error('Register Failed: Event Not Found', {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
          setIsEventNotFound(true);
        } else {
          toast.error(`Register Failed: ${errorMessage}`, {
            position: 'bottom-right',
            autoClose: 1500,
            theme: 'dark',
          });
        }
      }

      registrationInFlightRef.current = false;
    }
  }, [eventRegisterQuery.status, eventRegisterQuery.data, eventRegisterQuery.error]);

  useEffect(() => {
    setAlreadyJoined(false);
    setIsEventNotFound(false);
    registrationInFlightRef.current = false;
  }, [eventId]);

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
    if (registrationInFlightRef.current) {
      toast.warning('Registration is already in progress. Please wait.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

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

    registrationInFlightRef.current = true;
    eventRegisterQuery.mutate();
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
    if (!imagePath) return '/merci.png';
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
        title={`${eventData.Name} - ${getTypeLabel(eventData.Type)} | LapakBenz`}
        description={truncateText(stripHtml(eventData.Desc || ''), 155)}
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
            eventId={eventId || undefined}
            isAuthenticated={isAuthenticated && isAuthValidated}
            isPending={eventRegisterQuery.status === 'pending'}
            alreadyJoined={alreadyJoined}
            isEventNotFound={isEventNotFound}
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
