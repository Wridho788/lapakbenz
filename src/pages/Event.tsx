import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart } from '../contexts/CartContext';
import { usePostEvent, usePostArticle, useEventById } from '../api/hooks';
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
}


const tabs = ['Upcoming', 'Completed', 'News'];

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

const Event: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 60;
  const navigate = useNavigate();
  const { cartCount } = useCart();
  
  // API hooks
  const eventMutation = usePostEvent();
  const articleMutation = usePostArticle();
  const eventByIdQuery = useEventById(selectedEventId ?? '');

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
        const payload = activeTab === 0 
          ? { status: "0", limit: 100, offset: 0, chapter: "" }
          : { status: "1", limit: 100, offset: 0, chapter: "" };
        eventMutation.mutate(payload);
      } else if (activeTab === 2) {
        articleMutation.mutate({});
      }
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  }, [activeTab, eventMutation, articleMutation, refreshing]);

  // Fetch data on mount and tab change
  useEffect(() => {
    if (activeTab === 0 || activeTab === 1) {
      // Fetch events for upcoming/completed
      const payload = activeTab === 0 
        ? { status: "0", limit: 100, offset: 0, chapter: "" } // upcoming
        : { status: "1", limit: 100, offset: 0, chapter: "" }; // completed
      eventMutation.mutate(payload);
    } else if (activeTab === 2) {
      // Fetch articles for news
      articleMutation.mutate({});
    }
  }, [activeTab]);

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
      console.log('Event by ID response:', eventByIdQuery.data);
    }
    if (eventByIdQuery.error) {
      console.error('Event by ID error:', eventByIdQuery.error);
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
        overscrollBehavior: 'contain'
      }}
    >
      <AppbarDefault title="Events" onBack={handleBackClick} onCartClick={handleCartClick} cartCount={cartCount} />

      <div style={{
        height: pullDistance > 0 ? pullDistance : 0,
        transition: pulling.current ? 'none' : 'height 0.2s ease',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#555'
      }}>
        {(pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh') + (refreshing ? ' • refreshing...' : '')}
      </div>

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
                <div 
                  key={item.id} 
                  className="custom-event-card"
                  onClick={() => item.text && window.open(item.text, '_blank')}
                  style={{ cursor: item.text ? 'pointer' : 'default' }}
                >
                  <div className="event-row">
                    <div className="event-img-col">
                      <img
                        src={item.image || "/bea2x.jpg"}
                        alt={item.title || "News"}
                        style={{
                          maxWidth: '70px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/bea2x.jpg";
                        }}
                      />
                    </div>
                    <div className="event-info-col">
                      <div className="event-title-row">
                        <h3 className="event-title">{item.title || item.name}</h3>
                      </div>
                      <div className="event-date-row">
                        <span className="event-date">{item.created || item.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  key={item.id} 
                  className="custom-event-card"
                  onClick={() => handleEventClick(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="event-row">
                    <div className="event-img-col">
                      <img
                        src={item.image || "/bea2x.jpg"}
                        alt={item.name || "Event"}
                        style={{
                          maxWidth: '70px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/bea2x.jpg";
                        }}
                      />
                    </div>
                    <div className="event-info-col">
                      <div className="event-title-row">
                        <h3 className="event-title">{item.code} - {item.name}</h3>
                        <span className="event-chapter">{item.chapter}</span>
                      </div>
                      <div className="event-date-row">
                        <span className="event-date">{item.dates} - {item.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
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
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Event;
