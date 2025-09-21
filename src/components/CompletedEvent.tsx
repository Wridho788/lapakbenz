import React, { useEffect, useState } from 'react';

import { EventCard } from './EventCard';
import './CompletedEvent.css';
import { usePostEvent, useEventById } from '../api/hooks';

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

interface CompletedEventProps {
  className?: string;
}

export const CompletedEvent: React.FC<CompletedEventProps> = ({ className }) => {
  const eventMutation = usePostEvent();
  // Trigger API event POST on mount
  useEffect(() => {
    eventMutation.mutate({ eventType: 'completed' }); // sesuaikan payload jika perlu
  }, []);
  // Logging response/error
  useEffect(() => {
    if (eventMutation.data) {
      console.log('Event API response:', eventMutation.data);
    }
    if (eventMutation.error) {
      console.error('Event API error:', eventMutation.error);
    }
  }, [eventMutation.data, eventMutation.error]);
  // Ambil hasil eventMutation.data.content.result sebagai completedEvents
  const completedEvents: EventItem[] = eventMutation.data?.content?.result ?? [];

  // Jika result null atau empty, jangan render komponen
  if (!eventMutation.data?.content?.result || completedEvents.length === 0) {
    return null;
  }

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const eventByIdQuery = useEventById(selectedEventId ?? '');

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setModalOpen(true);
  };

  useEffect(() => {
    if (eventByIdQuery.error) {
      console.error('Event by ID error:', eventByIdQuery.error);
    }
  }, [eventByIdQuery.error]);

  return (
    <div className={`completed-event ${className || ''}`}>
      <div className="event-scroll-container">
        {completedEvents.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            image={event.image}
            title={event.code}
            date={event.dates}
            chapter={event.chapter}
            type={event.type_desc}
            onClick={handleEventClick}
          />
        ))}
      </div>
      <Modal open={modalOpen && !!eventByIdQuery.data?.content} onClose={() => setModalOpen(false)}>
        {eventByIdQuery.data?.content ? (
          <div>
            <img
              src={eventByIdQuery.data.content.image}
              alt={eventByIdQuery.data.content.name}
              style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
            />
            <h2>
              {eventByIdQuery.data.content.code} - {eventByIdQuery.data.content.name}
            </h2>
            <p>{eventByIdQuery.data.content.desc}</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {/* Kolom kiri */}
              <div style={{ flex: 1 }}>
                <p>
                  <b>Event Date:</b>
                  <br />
                  {eventByIdQuery.data.content.dates} - {eventByIdQuery.data.content.time}
                </p>
                <p>
                  <b>Chapter:</b>
                  <br />
                  {eventByIdQuery.data.content.chapter}
                </p>
                <p>
                  <b>Type:</b>
                  <br />
                  {eventByIdQuery.data.content.type_desc}
                </p>
                <p>
                  <b>Description:</b>
                  <br />
                  {eventByIdQuery.data.content.desc}
                </p>
              </div>
              {/* Kolom kanan */}
              <div style={{ flex: 1 }}>
                <p>
                  <b>Minimum Participation:</b>
                  <br />
                  {eventByIdQuery.data.content.minimum_participants}
                </p>
                <p>
                  <b>Contribution Fee:</b>
                  <br />
                  {eventByIdQuery.data.content.fee}
                </p>
                <p>
                  <b>Status:</b>
                  <br />
                  {eventByIdQuery.data.content.done_desc}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Modal>
    </div>
  );
};

// Simple modal component
const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({
  open,
  onClose,
  children,
}) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: '#fff',
          margin: '5% auto',
          padding: 24,
          borderRadius: 8,
          maxWidth: 400,
          position: 'relative',
        }}
      >
        <button style={{ position: 'absolute', top: 8, right: 8 }} onClick={onClose}>
          Tutup
        </button>
        {children}
      </div>
    </div>
  );
};
