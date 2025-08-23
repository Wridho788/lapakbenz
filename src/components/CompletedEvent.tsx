import React from 'react';
import './CompletedEvent.css';

interface EventItem {
  id: number;
  image: string;
  title: string;
  date: string;
  chapter: string;
  type: string;
}

interface CompletedEventProps {
  className?: string;
}

export const CompletedEvent: React.FC<CompletedEventProps> = ({ className }) => {
  // Sample completed events data
  const completedEvents: EventItem[] = [
    {
      id: 1,
      image: '/bea2x.jpg',
      title: 'SOTRBEABEA2x',
      date: '19 Juni 2024',
      chapter: 'MBW202.05',
      type: 'PRIVATE'
    },
    {
      id: 2,
      image: '/bea2x.jpg',
      title: 'BEABEA Training',
      date: '15 Mei 2024',
      chapter: 'MBW202.04',
      type: 'PUBLIC'
    },
    {
      id: 3,
      image: '/bea2x.jpg',
      title: 'Advanced Workshop',
      date: '10 April 2024',
      chapter: 'MBW202.03',
      type: 'PRIVATE'
    },
    {
      id: 4,
      image: '/bea2x.jpg',
      title: 'Community Meetup',
      date: '20 Maret 2024',
      chapter: 'MBW202.02',
      type: 'PUBLIC'
    },
    {
      id: 5,
      image: '/bea2x.jpg',
      title: 'Leadership Summit',
      date: '5 Februari 2024',
      chapter: 'MBW202.01',
      type: 'PRIVATE'
    }
  ];

  return (
    <div className={`completed-event ${className || ''}`}>
      <div className="event-scroll-container">
        {completedEvents.map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-image-container">
              <img
                src={event.image}
                alt={event.title}
                className="event-image"
                onError={(e) => {
                  // Fallback if image doesn't load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="event-content">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-date">{event.date}</p>
              <p className="event-chapter">{event.chapter}</p>
              <p className="event-type">{event.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
