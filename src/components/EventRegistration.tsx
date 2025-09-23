import React from 'react';
import './EventRegistration.css';

interface EventRegistrationProps {
  isAuthenticated: boolean;
  isPending: boolean;
  onRegister: () => void;
}

const EventRegistration: React.FC<EventRegistrationProps> = ({
  isAuthenticated,
  isPending,
  onRegister,
}) => {
  if (!isAuthenticated) return null;

  return (
    <div className="event-registration">
      <button
        onClick={onRegister}
        disabled={isPending}
        className={`registration-button ${isPending ? 'loading' : ''}`}
      >
        <div className="registration-button-content">
          <span className="registration-icon">
            {isPending ? '⏳' : '🎫'}
          </span>
          <span className="registration-text">
            {isPending ? 'Registering...' : 'Register Event Member'}
          </span>
        </div>
      </button>
    </div>
  );
};

export default EventRegistration;