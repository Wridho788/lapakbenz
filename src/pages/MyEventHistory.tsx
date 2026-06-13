import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useEventHistory } from '../api/hooks/index';
import { formatDate } from '../utils/dateUtils';
import './AccountPages.css';
import './Event.css';

interface EventItem {
  id?: number | string;
  club_id?: number;
  code?: string;
  name: string;
  dates?: string;
  date?: string;
  desc?: string;
  image?: string;
  fee?: number;
  minimum_participant?: number | string;
  minimum_participants?: string | number;
  type?: number;
  type_desc?: string;
  done?: number;
  done_desc?: string;
  status?: string;
  joined_at?: string;
  chapter?: string;
  [key: string]: any;
}

const FALLBACK_IMAGE = '/bea2x.jpg';

const MyEventHistory: React.FC = () => {
  const navigate = useNavigate();

  // Fetch events using the new hook
  const eventHistory = useEventHistory();

  // Modal state: event yang sedang ditampilkan detailnya
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    eventHistory.mutate({
      limit: '30',
      offset: '0',
    });
  }, []);

  // Lock body scroll selama modal terbuka
  useEffect(() => {
    document.body.style.overflow = selectedEvent ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedEvent]);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedEvent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const eventsResponse = eventHistory.data;
  const events: EventItem[] = eventsResponse?.result || [];
  const eventImageUrl = eventsResponse?.image_url || '';
  // const eventsLoading = eventHistory.isLoading;
  const eventsError = eventHistory.error;

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const getImageSrc = (event: EventItem) => {
    if (!event.image) return FALLBACK_IMAGE;
    if (event.image.startsWith('http')) return event.image;
    return `${eventImageUrl}${event.image}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
  };

  // Tentukan label & style badge status (selesai / akan datang)
  // const getStatusInfo = (event: EventItem) => {
  //   const label = event.done_desc || event.status || (event.done === 1 ? 'Selesai' : 'Akan Datang');
  //   const isCompleted = event.done === 1 || /selesai|completed|done/i.test(String(label));
  //   return { label, className: isCompleted ? 'completed' : 'upcoming' };
  // };

  const getEventDate = (event: EventItem) => {
    const raw = event.dates || event.date;
    return raw ? formatDate(raw) : '-';
  };

  // Uncomment below to test empty state
  //   const events: any[] = [];

  return (
    <div className="account-page">
      <AppbarDefault
        title="Riwayat Event Saya"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />

      <div className="account-content">
        <div className="account-card">
          <h3>Riwayat Partisipasi Event</h3>

          {/* Show error state */}
          {eventsError && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#ff6b6b',
              }}
            >
              Gagal memuat event. Silakan coba lagi.
            </div>
          )}

          {/* Show events data as a list, or fallback to empty state */}
          {!eventsError && events.length > 0 ? (
            <div className="event-list">
              {events.map((event) => {
                // const status = getStatusInfo(event);
                return (
                  <div
                    key={event.id?.toString() || event.name || 'event'}
                    className="custom-event-card"
                    onClick={() => setSelectedEvent(event)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedEvent(event);
                      }
                    }}
                  >
                    <div className="event-row">
                      <div className="event-img-col">
                        <img
                          src={getImageSrc(event)}
                          alt={event.name}
                          style={{
                            maxWidth: '70px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                          onError={handleImageError}
                        />
                      </div>
                      <div className="event-info-col">
                        <div className="event-title-row">
                          <h3 className="event-title">{event.name}</h3>
                          <span className="event-chapter">{event.chapter}</span>
                        </div>
                        <div className="event-date-row">
                          <span className="event-date">{getEventDate(event)}</span>
                        </div>
                      </div>
                      {/* <span className={`event-status-pill ${status.className}`}>
                        {status.label}
                      </span> */}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !eventsError ? (
            <div className="empty-state">
              <img src="/nodata.png" alt="No Data" className="empty-icon" />
              <h3>Tidak Ada Riwayat Event</h3>
              <p>
                Anda belum pernah mengikuti event apapun. Mulai jelajahi event untuk membangun riwayat Anda!
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal Detail Event */}
      {selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div
            className="event-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedEvent.name}
          >
            <button
              className="event-modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Tutup"
              type="button"
            >
              &times;
            </button>

            {/* Gambar + Badge Status */}
            {selectedEvent.image && (
              <div className="event-modal-image-wrap">
                <img
                  src={getImageSrc(selectedEvent)}
                  alt={selectedEvent.name}
                  className="event-modal-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="event-modal-status-badge">
                  {selectedEvent.done_desc || selectedEvent.status || 'Available'}
                </div>
              </div>
            )}

            <div className="event-modal-body">
              <div className="event-modal-grid">
                {/* Nama */}
                <div className="event-modal-field">
                  <div className="event-modal-label">NAMA EVENT</div>
                  <div className="event-modal-value">{selectedEvent.name}</div>
                </div>

                {/* Tanggal */}
                <div className="event-modal-field">
                  <div className="event-modal-label">TANGGAL</div>
                  <div className="event-modal-value">{getEventDate(selectedEvent)}</div>
                </div>

                {/* Chapter */}
                <div className="event-modal-field">
                  <div className="event-modal-label">CHAPTER</div>
                  <div className="event-modal-value">{selectedEvent.chapter || '-'}</div>
                </div>

                {/* Waktu */}
                {selectedEvent.time && (
                  <div className="event-modal-field">
                    <div className="event-modal-label">WAKTU</div>
                    <div className="event-modal-value">{selectedEvent.time}</div>
                  </div>
                )}

                {/* Kode Event */}
                {selectedEvent.code && (
                  <div className="event-modal-field">
                    <div className="event-modal-label">KODE EVENT</div>
                    <div className="event-modal-value">{selectedEvent.code}</div>
                  </div>
                )}

                {/* Biaya */}
                {selectedEvent.fee !== null && selectedEvent.fee !== undefined && (
                  <div className="event-modal-field">
                    <div className="event-modal-label">BIAYA</div>
                    <div className="event-modal-value">
                      Rp {Number(selectedEvent.fee).toLocaleString('id-ID')}
                    </div>
                  </div>
                )}

                {/* Min. Peserta */}
                {(selectedEvent.minimum_participants || selectedEvent.minimum_participant) && (
                  <div className="event-modal-field">
                    <div className="event-modal-label">MIN. PESERTA</div>
                    <div className="event-modal-value">
                      {selectedEvent.minimum_participants || selectedEvent.minimum_participant}
                    </div>
                  </div>
                )}
              </div>

              {/* Deskripsi */}
              {selectedEvent.desc && (
                <div className="event-modal-desc-block">
                  <div className="event-modal-label">DESKRIPSI</div>
                  <div className="event-modal-value">{selectedEvent.desc}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyEventHistory;