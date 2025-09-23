import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import EventListCard from '../components/EventListCard';
import NewsCard from '../components/NewsCard';
import EventModal from '../components/EventModal';
import ChapterFilter from '../components/ChapterFilter';
import { useAuthStore } from '../stores/authStore';
import { useCart } from '../contexts/CartContext';
import { usePostEvent, usePostArticle, useEventById, useEventRegister } from '../api/hooks';
import Swal from 'sweetalert2';
import './Event.css';
import '../components/FABPositioning.css';

// Interface sesuai dengan API response
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

interface RegistrationData {
  transid: number;
  ordercode: string;
  invoice_url: string;
}

const tabs = ['Upcoming', 'Completed', 'News'];

const Event: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 60;
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuthStore();

  // API hooks
  const eventMutation = usePostEvent();
  const articleMutation = usePostArticle();
  const eventRegisterMutation = useEventRegister();
  // Only call useEventById when modal is open and eventId is selected
  const eventByIdQuery = useEventById(modalOpen && selectedEventId ? selectedEventId : '');

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || startY.current === null) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      e.preventDefault();
      setPullDistance(Math.min(diff, 120));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > PULL_THRESHOLD) {
      triggerRefresh();
    }
    pulling.current = false;
    startY.current = null;
    setTimeout(() => setPullDistance(0), 150);
  };

  const triggerRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      // Refresh current tab data
      if (activeTab === 0 || activeTab === 1) {
        const chapterParam = selectedChapters.length > 0 ? selectedChapters.join(',') : '';
        const payload =
          activeTab === 0
            ? { status: '0', limit: 100, offset: 0, chapter: chapterParam }
            : { status: '1', limit: 100, offset: 0, chapter: chapterParam };
        eventMutation.mutate(payload);
      } else if (activeTab === 2) {
        articleMutation.mutate({});
      }
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  }, [activeTab, eventMutation, articleMutation, refreshing, selectedChapters]);

  // Fetch data on mount and tab change or chapter selection change
  useEffect(() => {
    if (activeTab === 0 || activeTab === 1) {
      // Fetch events for upcoming/completed
      const chapterParam = selectedChapters.length > 0 ? selectedChapters.join(',') : '';
      const payload =
        activeTab === 0
          ? { status: '0', limit: 100, offset: 0, chapter: chapterParam } // upcoming
          : { status: '1', limit: 100, offset: 0, chapter: chapterParam }; // completed
      eventMutation.mutate(payload);
    } else if (activeTab === 2) {
      // Fetch articles for news
      articleMutation.mutate({});
    }
  }, [activeTab, selectedChapters]);

  // Handle chapter selection change
  const handleChapterSelectionChange = (newSelectedChapters: string[]) => {
    setSelectedChapters(newSelectedChapters);
    // The useEffect above will automatically trigger the API call
  };

  // Logging API responses
  useEffect(() => {
    if (eventMutation.data) {
      console.log('Event API response:', eventMutation.data);
    }
    if (eventMutation.error) {
      console.error('Event API error:', eventMutation.error);
    }
  }, [eventMutation.data, eventMutation.error]);

  useEffect(() => {
    if (articleMutation.data) {
      console.log('Article API response:', articleMutation.data);
    }
    if (articleMutation.error) {
      console.error('Article API error:', articleMutation.error);
    }
  }, [articleMutation.data, articleMutation.error]);

  useEffect(() => {
    if (eventByIdQuery.data) {
      console.log('🎉 Event by ID response:', eventByIdQuery.data);
      if (eventByIdQuery.data.content) {
        console.log('📋 Event Detail Data:', eventByIdQuery.data.content);
        console.log('🔍 Allow Merchant:', eventByIdQuery.data.content.allow_merchant);
        console.log('🔍 Allow Public:', eventByIdQuery.data.content.allow_public);
      }
    }
    if (eventByIdQuery.error) {
      console.error('❌ Event by ID error:', eventByIdQuery.error);
    }
  }, [eventByIdQuery.data, eventByIdQuery.error]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setModalOpen(true);
    setRegistrationData(null); // Reset registration data when opening new event
  };

  // Helper function to ensure URL has https protocol (same as Invoice page)
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

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

  const handleOpenInvoice = () => {
    if (registrationData?.invoice_url) {
      const fullUrl = getFullUrl(registrationData.invoice_url);
      window.open(fullUrl, '_blank');
    }
  };

  const getFilteredData = () => {
    if (activeTab === 2) {
      // News data from article API
      return articleMutation.data?.content?.result ?? [];
    } else {
      // Event data from event API
      const events: EventItem[] = eventMutation.data?.content?.result ?? [];
      if (activeTab === 0) {
        // Upcoming: done = 0
        return events.filter((event) => event.done === 0);
      } else {
        // Completed: done = 1
        return events.filter((event) => event.done === 1);
      }
    }
  };

  const isLoading = () => {
    if (activeTab === 2) {
      return articleMutation.isPending || refreshing;
    } else {
      return eventMutation.isPending || refreshing;
    }
  };

  return (
    <div
      className="event-page"
      ref={pullRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        overscrollBehavior: 'contain',
      }}
    >
      <AppbarDefault
        title="Events"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
      />

      <div
        style={{
          height: pullDistance > 0 ? pullDistance : 0,
          transition: pulling.current ? 'none' : 'height 0.2s ease',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#555',
        }}
      >
        {(pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh') +
          (refreshing ? ' • refreshing...' : '')}
      </div>

      {/* Chapter Filter - Only show for Upcoming and Completed tabs */}
      {(activeTab === 0 || activeTab === 1) && (
        <ChapterFilter
          selectedChapters={selectedChapters}
          onSelectionChange={handleChapterSelectionChange}
          disabled={isLoading()}
        />
      )}

      <div className="event-tabs">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={activeTab === idx ? 'active' : ''}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="event-content">
        <div className="event-list">
          {isLoading() ? (
            <div className="loading-state">
              <p>{refreshing ? 'Refreshing...' : 'Loading...'}</p>
            </div>
          ) : (
            getFilteredData().map((item: any) =>
              tabs[activeTab] === 'News' ? (
                <NewsCard
                  key={item.id}
                  news={item}
                  onClick={() => item.text && window.open(item.text, '_blank')}
                />
              ) : (
                <EventListCard
                  key={item.id}
                  event={item}
                  onClick={() => handleEventClick(item.id)}
                />
              ),
            )
          )}

          {!isLoading() && getFilteredData().length === 0 && (
            <div className="empty-state">
              <img src="/nodata.png" alt="No Data" className="empty-icon" />
              <h3>No {tabs[activeTab]}</h3>
              <p>There are no {tabs[activeTab].toLowerCase()} at the moment. Check back later!</p>
            </div>
          )}
        </div>
      </div>
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventContent={eventByIdQuery.data?.content || null}
        isLoading={eventByIdQuery.isLoading}
        isAuthenticated={isAuthenticated}
        registrationPending={eventRegisterMutation.isPending}
        registrationData={registrationData}
        onEventRegister={handleEventRegister}
        onOpenInvoice={handleOpenInvoice}
        selectedEventId={selectedEventId}
      />
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Event;