import React, { useEffect, useState } from 'react';

import { EventCard } from './EventCard';
import EventModal from './EventModal';
import './CompletedEvent.css';
import { usePostEvent, useEventById, useEventRegister } from '../api/hooks';
import Swal from 'sweetalert2';

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

interface RegistrationData {
  transid: number;
  ordercode: string;
  invoice_url: string;
}

export const CompletedEvent: React.FC<CompletedEventProps> = ({ className }) => {
  // Move ALL hooks to the top, before any conditional logic
  const eventMutation = usePostEvent();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const eventByIdQuery = useEventById(selectedEventId ?? '');
  const eventRegisterMutation = useEventRegister();

  useEffect(() => {
    eventMutation.mutate({ status: '0', limit: 100, offset: 0, chapter: '' }); // Fetch completed events (status "0")
  }, []);

  useEffect(() => {
    if (eventByIdQuery.error) {
      console.error('Event by ID error:', eventByIdQuery.error);
    }
  }, [eventByIdQuery.error]);

  // Ambil hasil eventMutation.data.content.result sebagai completedEvents
  const completedEvents: EventItem[] = eventMutation.data?.content?.result ?? [];

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setModalOpen(true);
  };

  // Now do conditional rendering AFTER all hooks have been called
  if (!eventMutation.data?.content?.result || completedEvents.length === 0) {
    return null;
  }

  const handleEventRegister = async () => {
    if (!selectedEventId) {
      Swal.fire({
        icon: 'error',
        title: 'Event ID Missing',
        text: 'Please select an event first.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    try {
      console.log('🎫 Starting event registration for:', selectedEventId);

      const result = await eventRegisterMutation.mutateAsync({
        eventId: selectedEventId,
      });

      console.log('🎫 Event Registration Response:', result);

      if (result.status === 200 && result.content) {
        setRegistrationData({
          transid: result.content.transid,
          ordercode: result.content.ordercode,
          invoice_url: result.content.invoice_url,
        });

        Swal.fire({
          icon: 'success',
          title: '🎉 Registration Successful!',
          text: 'Your event registration has been completed successfully.',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Continue',
        });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Event Registration Failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.error || 'Event registration failed. Please try again.',
        confirmButtonColor: '#3b82f6',
        footer: 'Please check your information and try again.',
      });
    }
  };

  const getFullUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleOpenInvoice = () => {
    if (registrationData?.invoice_url) {
      const fullUrl = getFullUrl(registrationData.invoice_url);
      window.open(fullUrl, '_blank');
    }
  };

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
      {/* Use EventModal for event details */}
      <EventModal
        isOpen={modalOpen && !!eventByIdQuery.data?.content}
        onClose={() => setModalOpen(false)}
        eventContent={eventByIdQuery.data?.content || null}
        isLoading={eventByIdQuery.isLoading}
        isAuthenticated={true}
        registrationPending={false}
        registrationData={null}
        onEventRegister={handleEventRegister}
        onOpenInvoice={handleOpenInvoice}
        selectedEventId={selectedEventId}
      />
    </div>
  );
};
