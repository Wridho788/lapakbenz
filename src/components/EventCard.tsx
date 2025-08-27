import React from 'react';
import './EventCard.css';

interface EventCardProps {
  id: string;
  image: string;
  title: string; // code
  date: string; // dates
  chapter: string;
  type: string; // type_desc
  onClick?: (id: string) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  image,
  title,
  date,
  chapter,
  type,
  onClick,
  className
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div 
      className={`event-card ${className || ''}`}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      <div className="event-card-image-container">
        <img
          src={image}
          alt={title}
          className="event-card-image"
          onError={(e) => {
            // Fallback if image doesn't load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
      <div className="event-card-content">
        <h3 className="event-card-title">{title}</h3>
        <p className="event-card-date">{date}</p>
        <p className="event-card-chapter">{chapter}</p>
        <p className="event-card-type">{type}</p>
      </div>
    </div>
  );
};
