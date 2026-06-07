import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from './EventCard';
import './CompletedEvent.css';
import { useEventList } from '../api/hooks/index';
import { createEventUrl } from '../api/codeMapping';
import { formatDate } from '../utils/dateUtils';

interface CompletedEventProps {
  className?: string;
}

export const CompletedEvent: React.FC<CompletedEventProps> = ({ className }) => {
  const navigate = useNavigate();

  const { data: eventsData, isLoading } = useEventList({ status: '0', limit: '50', offset: '0' });

  const completedEvents = eventsData?.result ?? [];
  const imageUrl = eventsData?.image_url || '';

  const handleEventClick = (event: any) => {
    const eventUrl = createEventUrl(String(event.ID), event.Code ?? '');
    navigate(eventUrl);
  };

  if (isLoading) {
    return null;
  }

  if (completedEvents.length === 0) {
    return null;
  }

  return (
    <div className={`completed-event ${className || ''}`}>
      <div className="event-scroll-container">
        {completedEvents.map((event) => (
          <EventCard
            key={event.ID}
            id={String(event.ID)}
            image={imageUrl + event.Image}
            title={event.Code}
            date={formatDate(event.Dates)}
            chapter={event.chapter_name}
            type={event.type_label}
            event={event}
            onClick={handleEventClick}
          />
        ))}
      </div>
    </div>
  );
};
