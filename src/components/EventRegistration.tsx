import React from 'react';
import { useAuthStore } from '../stores/authStore';
import './EventRegistration.css';

interface EventRegistrationProps {
  eventId?: string;
  isAuthenticated: boolean;
  isPending: boolean;
  alreadyJoined?: boolean;
  isEventNotFound?: boolean;
  onRegister: () => void;
}

const EventRegistration: React.FC<EventRegistrationProps> = ({
  isAuthenticated,
  isPending,
  alreadyJoined = false,
  isEventNotFound = false,
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
        disabled={isPending || alreadyJoined || isEventNotFound}
        className={`registration-button ${isPending ? 'loading' : ''} ${alreadyJoined || isEventNotFound ? 'already-joined' : ''}`}
        title={isEventNotFound ? 'Event tidak ditemukan' : alreadyJoined ? 'Anda sudah terdaftar' : ''}
      >
        <div className="registration-button-content">
          <span className="registration-icon">
            {isPending ? '⏳' : isEventNotFound ? '✗' : alreadyJoined ? '✓' : '🎫'}
          </span>
          <span className="registration-text">
            {isPending ? 'Registering...' : isEventNotFound ? 'Event Tidak Ditemukan' : alreadyJoined ? 'Sudah Terdaftar' : 'Join Event'}
          </span>
        </div>
      </button>
    </div>
  );
};

export default EventRegistration;
