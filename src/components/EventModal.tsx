import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import EventRegistration from './EventRegistration';
import RegistrationSuccess from './RegistrationSuccess';
import './EventModal.css';

interface EventContent {
  id: string;
  chapter_id: string;
  chapter: string;
  code: string;
  name: string;
  dates: string;
  time: string;
  desc: string;
  image: string;
  fee: number;
  minimum_participants: string;
  type: number;
  type_desc: string;
  done: number;
  done_desc: string;
  allow_merchant?: number;
  allow_public?: number;
}

interface RegistrationData {
  transid: number;
  ordercode: string;
  invoice_url: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventContent: EventContent | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  registrationPending: boolean;
  registrationData: RegistrationData | null;
  onEventRegister: () => void;
  onOpenInvoice: () => void;
  selectedEventId: string | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  eventContent,
  isLoading,
  isAuthenticated,
  registrationPending,
  registrationData,
  onEventRegister,
  onOpenInvoice,
  selectedEventId,
}) => {
  const navigate = useNavigate();

  const handleMerchantRegistration = () => {
    if (selectedEventId) {
      navigate(`/merchant-registration/${selectedEventId}`);
    } else {
      console.error('❌ No event ID selected for merchant registration');
    }
  };

  const handlePublicRegistration = () => {
    if (selectedEventId) {
      navigate(`/public-registration/${selectedEventId}`);
    } else {
      console.error('❌ No event ID selected for public registration');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      {eventContent ? (
        <div>
          <img
            src={eventContent.image}
            alt={eventContent.name}
            className="event-modal-image"
          />
          <h3 className="event-modal-title">
            {eventContent.code} - {eventContent.name}
          </h3>
          
          <div className="event-modal-details">
            <div className="event-modal-column">
              <div className="event-detail-item">
                <b>Tanggal Event:</b>
                <br />
                {eventContent.dates} - {eventContent.time}
              </div>
              <div className="event-detail-item">
                <b>Chapter:</b>
                <br />
                {eventContent.chapter}
              </div>
              <div className="event-detail-item">
                <b>Tipe:</b>
                <br />
                {eventContent.type_desc}
              </div>
              <div className="event-detail-item">
                <b>Deskripsi:</b>
                <br />
                {eventContent.desc}
              </div>
            </div>
            
            <div className="event-modal-column">
              <div className="event-detail-item">
                <b>Minimal Peserta:</b>
                <br />
                {eventContent.minimum_participants}
              </div>
              <div className="event-detail-item">
                <b>Biaya Kontribusi:</b>
                <br />
                {eventContent.fee}
              </div>
              <div className="event-detail-item">
                <b>Status:</b>
                <br />
                {eventContent.done_desc}
              </div>
            </div>
          </div>

          <EventRegistration
            isAuthenticated={isAuthenticated}
            isPending={registrationPending}
            onRegister={onEventRegister}
          />

          {registrationData && (
            <RegistrationSuccess
              registrationData={registrationData}
              onOpenInvoice={onOpenInvoice}
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
      ) : (
        <div className="event-modal-loading">
          {isLoading ? 'Memuat detail event...' : 'Data event tidak tersedia'}
        </div>
      )}
    </Modal>
  );
};

export default EventModal;