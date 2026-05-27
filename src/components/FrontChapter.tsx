import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from './EventCard';
import './CompletedEvent.css';
import { usePostEvent } from '../api/hooks/index';
import { createEventUrl } from '../api/codeMapping';

interface EventItem {
  ID?: number;
  ClubID?: number;
  Code?: string;
  Name?: string;
  Dates?: string;
  Desc?: string;
  Image?: string;
  Fee?: number;
  MerchantCost?: number;
  MerchantQuota?: number;
  Cost1?: number;
  Cost2?: number;
  Type?: number;
  MinimumParticipant?: number;
  Done?: number;
  Point?: number;
  AllowMerchant?: number;
  AllowPublic?: number;
  Created?: string;
  Updated?: string;
  Deleted?: string | null;
  chapter_name?: string;
  chapter_code?: string;
  type_label?: string;
  done_label?: string;
  [key: string]: any;
}

interface FrontChapterProps {
  className?: string;
  chapterId: string;
}

export const FrontChapter: React.FC<FrontChapterProps> = ({ className, chapterId }) => {
  // Move ALL hooks to the top, before any conditional logic
  const eventMutation = usePostEvent();
  const navigate = useNavigate();

  // Fetch events for this specific chapter on component mount
  useEffect(() => {
    eventMutation.mutate({
      status: '',
      limit: '15',
      offset: '0',
      chapter: `${chapterId}`
    });
  }, [chapterId]);

  // Get events from the API response
  const chapterEvents: EventItem[] = eventMutation.data?.result ?? [];
  const handleEventClick = (event: EventItem) => {
    if (!event.ID) return;
    const eventUrl = createEventUrl(String(event.ID), event.Code);
    navigate(eventUrl);
  };

  // Now do conditional rendering AFTER all hooks have been called
  if (eventMutation.isPending) {
    return (
      <div className={`completed-event ${className || ''}`}>
        <div className="event-scroll-container">
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (eventMutation.error) {
    console.error('Chapter Events Error:', eventMutation.error);
    return null;
  }

  if (!eventMutation.data?.result || chapterEvents.length === 0) {
    return null;
  }

  return (
    <div className={`completed-event ${className || ''}`}>
      <div className="event-scroll-container">
        {chapterEvents.map((event) => (
          <EventCard
            key={event.ID}
            id={String(event.ID)}
            image={(eventMutation?.data?.image_url ?? '') + (event?.Image ?? '')}
            title={event.Name}
            date={event.Dates}
            chapter={event.chapter_name}
            type={event.type_label}
            // event={event}
            onClick={() => handleEventClick(event)}
          />
        ))}
      </div>
    </div>
  );
};