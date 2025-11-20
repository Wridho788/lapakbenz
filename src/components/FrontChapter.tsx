import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from './EventCard';
import './CompletedEvent.css';
import { usePostEvent } from '../api/hooks/index';
import { createEventUrl } from '../api/codeMapping';

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
      limit: 15,
      offset: 0,
      chapter: chapterId
    });
  }, [chapterId]);

  // Get events from the API response
  const chapterEvents: EventItem[] = eventMutation.data?.content?.result ?? [];

  const handleEventClick = (event: EventItem) => {
    // Create SEO-friendly URL with ID and code slug
    const eventUrl = createEventUrl(event.id, event.code);
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

  if (!eventMutation.data?.content?.result || chapterEvents.length === 0) {
    return null;
  }

  return (
    <div className={`completed-event ${className || ''}`}>
      <div className="event-scroll-container">
        {chapterEvents.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            image={event.image || '/bea2x.jpg'}
            title={event.code}
            date={event.dates}
            chapter={event.chapter}
            type={event.type_desc}
            event={event}
            onClick={() => handleEventClick(event)}
          />
        ))}
      </div>
    </div>
  );
};