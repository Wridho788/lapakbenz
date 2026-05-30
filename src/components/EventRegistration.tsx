import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';
import './EventRegistration.css';

interface EventRegistrationProps {
  eventId?: string;
  isAuthenticated: boolean;
  isPending: boolean;
  onRegister: () => void;
}

const EventRegistration: React.FC<EventRegistrationProps> = ({
  eventId,
  isAuthenticated,
  isPending,
  onRegister,
}) => {
  const { token, validateToken } = useAuthStore();
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  const isValidAuthentication = isAuthenticated && token && validateToken();

  useEffect(() => {
    setAlreadyJoined(false);
  }, [eventId]);

  if (!isValidAuthentication) {
    return null;
  }

  const handleRegisterClick = () => {
    if (alreadyJoined || isPending) {
      toast.error('Anda sudah terdaftar di event ini.', {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'dark',
      });
      return;
    }
    setAlreadyJoined(true);
    onRegister();
  };

  return (
    <div className="event-registration">
      <button
        onClick={handleRegisterClick}
        disabled={isPending || alreadyJoined}
        className={`registration-button ${isPending ? 'loading' : ''} ${alreadyJoined ? 'already-joined' : ''}`}
      >
        <div className="registration-button-content">
          <span className="registration-icon">
            {isPending ? '⏳' : alreadyJoined ? '✓' : '🎫'}
          </span>
          <span className="registration-text">
            {isPending ? 'Registering...' : alreadyJoined ? 'Sudah Terdaftar' : 'Join Event'}
          </span>
        </div>
      </button>
    </div>
  );
};

export default EventRegistration;