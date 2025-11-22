import React from 'react';
import '../pages/Event.css';

interface EventItem {
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

interface EventListCardProps {
  event: EventItem;
  onClick: (eventId: string) => void;
  isGrid?: boolean;
}

const EventListCard: React.FC<EventListCardProps> = ({ event, onClick, isGrid = false }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/bea2x.jpg';
  };

  if (isGrid) {
    return (
      <div
        className="custom-event-card grid-card"
        onClick={() => onClick(event.id)}
        style={{ cursor: 'pointer' }}
      >
        <div className="event-grid-layout">
          <div className="event-img-grid">
            <img
              src={event.image || '/bea2x.jpg'}
              alt={event.name || 'Event'}
              className="grid-event-image"
              onError={handleImageError}
            />
          </div>
          <div className="event-info-grid">
            <div className="event-title-grid">
              <h4 className="grid-event-title">{event.name}</h4>
            </div>
            <div className="event-meta-grid">
              <span className="grid-event-chapter">{event.chapter}</span>
              <span className="grid-event-date">{event.dates}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="custom-event-card"
      onClick={() => onClick(event.id)}
      style={{ cursor: 'pointer' }}
    >
      <div className="event-row">
        <div className="event-img-col">
          <img
            src={event.image || '/bea2x.jpg'}
            alt={event.name || 'Event'}
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
            <h3 className="event-title">
              {event.name}
            </h3>
            <span className="event-chapter">{event.chapter}</span>
          </div>
          <div className="event-date-row">
            <span className="event-date">
              {event.dates} - {event.time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventListCard;