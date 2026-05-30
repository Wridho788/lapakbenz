import React from 'react';
import { useAuthStore } from '../stores/authStore';
import './EventRegistration.css';

interface EventRegistrationProps {
  eventId?: string;
  isAuthenticated: boolean;
  isPending: boolean;
  alreadyJoined?: boolean;
  onRegister: () => void;
}

const EventRegistration: React.FC<EventRegistrationProps> = ({
  isAuthenticated,
  isPending,
  alreadyJoined = false,
  onRegister,
}) => {
  const { token, validateToken } = useAuthStore();

  const isValidAuthentication = isAuthenticated && token && validateToken();

  if (!isValidAuthentication) {
    return null;
  }

  return (
    <div className="event-registration">
      <button
        onClick={onRegister}
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
