import React from 'react';
import type { EventItem } from '../api/types/eventTypes';
import '../pages/Event.css';

interface EventListCardProps {
  event: EventItem;
  onClick: (event: EventItem) => void;
  isGrid?: boolean;
  imageUrl?: string;
}

const EventListCard: React.FC<EventListCardProps> = ({ event, onClick, isGrid = false, imageUrl }) => {
  const getImageSrc = () => {
    if (!event.Image) return '/bea2x.jpg';
    if (event.Image.startsWith('http')) return event.Image;
    return `${imageUrl || ''}${event.Image}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = '/bea2x.jpg';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (isGrid) {
    return (
      <div
        className="custom-event-card grid-card"
        onClick={() => onClick(event)}
        style={{ cursor: 'pointer' }}
      >
        <div className="event-grid-layout">
          <div className="event-img-grid">
            <img
              src={getImageSrc()}
              alt={event.Name || 'Event'}
              className="grid-event-image"
              onError={handleImageError}
            />
          </div>
          <div className="event-info-grid">
            <div className="event-title-grid">
              <h4 className="grid-event-title">{event.Name}</h4>
            </div>
            <div className="event-meta-grid">
              <span className="grid-event-chapter">{event.chapter_name}</span>
              <span className="grid-event-date">{formatDate(event.Dates)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="custom-event-card"
      onClick={() => onClick(event)}
      style={{ cursor: 'pointer' }}
    >
      <div className="event-row">
        <div className="event-img-col">
          <img
            src={getImageSrc()}
            alt={event.Name || 'Event'}
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
              {event.Name}
            </h3>
            <span className="event-chapter">{event.chapter_name}</span>
          </div>
          <div className="event-date-row">
            <span className="event-date">
              {formatDate(event.Dates)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventListCard;