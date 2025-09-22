import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
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
  const [registrationData, setRegistrationData] = useState<{
    transid: number;
    ordercode: string;
    invoice_url: string;
  } | null>(null);
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
        const payload =
          activeTab === 0
            ? { status: '0', limit: 100, offset: 0, chapter: '' }
            : { status: '1', limit: 100, offset: 0, chapter: '' };
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
      const payload =
        activeTab === 0
          ? { status: '0', limit: 100, offset: 0, chapter: '' } // upcoming
          : { status: '1', limit: 100, offset: 0, chapter: '' }; // completed
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
  };

  const handleMerchantRegistration = () => {
    console.log('🏪 Merchant Registration clicked for event:', selectedEventId);
    if (selectedEventId) {
      navigate(`/merchant-registration/${selectedEventId}`);
    } else {
      console.error('❌ No event ID selected for merchant registration');
    }
  };

  const handlePublicRegistration = () => {
    console.log('👤 Public Registration clicked for event:', selectedEventId);
    if (selectedEventId) {
      navigate(`/public-registration/${selectedEventId}`);
    } else {
      console.error('❌ No event ID selected for public registration');
    }
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
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    try {
      console.log('🎫 Starting event registration for:', selectedEventId);
      
      const result = await eventRegisterMutation.mutateAsync({
        eventId: selectedEventId
      });

      console.log('🎫 Event Registration Response:', result);

      if (result.status === 200 && result.content) {
        setRegistrationData({
          transid: result.content.transid,
          ordercode: result.content.ordercode,
          invoice_url: result.content.invoice_url
        });

        Swal.fire({
          icon: 'success',
          title: '🎉 Registration Successful!',
          text: 'Your event registration has been completed successfully.',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Continue'
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
        footer: 'Please check your information and try again.'
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
                        src={item.image || '/bea2x.jpg'}
                        alt={item.title || 'News'}
                        style={{
                          maxWidth: '70px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/bea2x.jpg';
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
                        src={item.image || '/bea2x.jpg'}
                        alt={item.name || 'Event'}
                        style={{
                          maxWidth: '70px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/bea2x.jpg';
                        }}
                      />
                    </div>
                    <div className="event-info-col">
                      <div className="event-title-row">
                        <h3 className="event-title">
                          {item.code} - {item.name}
                        </h3>
                        <span className="event-chapter">{item.chapter}</span>
                      </div>
                      <div className="event-date-row">
                        <span className="event-date">
                          {item.dates} - {item.time}
                        </span>
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
          <div style={{ maxHeight: '80vh', overflowY: 'auto', scrollBehavior: 'smooth' }}>
        <img
          src={eventByIdQuery.data.content.image}
          alt={eventByIdQuery.data.content.name}
          style={{ width: '100%', borderRadius: 8 }}
        />
        <h3>
          {eventByIdQuery.data.content.code} - {eventByIdQuery.data.content.name}
        </h3>
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

        {/* Event Registration Button */}
        <div
          style={{
            marginTop: 24,
            padding: '16px',
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            borderRadius: '12px',
            border: '1px solid #d1d5db'
          }}
        >
          <button
            onClick={handleEventRegister}
            disabled={eventRegisterMutation.isPending}
            style={{
          width: '100%',
          padding: '14px 20px',
          background: eventRegisterMutation.isPending 
            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
            : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: '600',
          cursor: eventRegisterMutation.isPending ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '15px',
          letterSpacing: '0.025em',
          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
            }}
            onMouseOver={(e) => {
          if (!eventRegisterMutation.isPending) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(139, 92, 246, 0.5)';
          }
            }}
            onMouseOut={(e) => {
          if (!eventRegisterMutation.isPending) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(139, 92, 246, 0.39)';
          }
            }}
          >
            <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
            >
          <span style={{ fontSize: '18px' }}>
            {eventRegisterMutation.isPending ? '⏳' : '🎫'}
          </span>
          <span>
            {eventRegisterMutation.isPending ? 'Registering...' : 'Register Event Member'}
          </span>
            </div>
          </button>
        </div>

        {/* Registration Success Section */}
        {registrationData && (
          <div
            style={{
          marginTop: 16,
          padding: '20px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          borderRadius: '12px',
          border: '2px solid #10b981',
            }}
          >
            <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
          }}
            >
          <span style={{ fontSize: '24px', marginRight: '8px' }}>✅</span>
          <h4 style={{ margin: 0, color: '#065f46', fontSize: '18px', fontWeight: '600' }}>
            Registration Completed
          </h4>
            </div>

            <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>Transaction ID:</span>
            <span style={{ color: '#065f46', fontWeight: '500' }}>{registrationData.transid}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>Order Code:</span>
            <span style={{ color: '#065f46', fontWeight: '500' }}>{registrationData.ordercode}</span>
          </div>
            </div>

            <button
          onClick={handleOpenInvoice}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(16, 185, 129, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(16, 185, 129, 0.39)';
          }}
            >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>💳</span>
            <span>Open Payment Invoice</span>
          </div>
            </button>
          </div>
        )}

        {/* Registration Navigation */}
        {(eventByIdQuery.data.content.allow_merchant === 1 ||
          eventByIdQuery.data.content.allow_public === 1) && (
          <div
            style={{
          paddingTop: 24,
          borderTop: '2px solid #f0f0f0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '12px',
          padding: '8px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
          style={{
            display: 'flex',
            gap: 16,
            width: '100%',
            flexDirection: window.innerWidth < 400 ? 'column' : 'row',
          }}
            >
          {/* Merchant Registration Button */}
          {eventByIdQuery.data.content.allow_merchant === 1 && (
            <button
              onClick={handleMerchantRegistration}
              style={{
            flex: 1,
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '15px',
            letterSpacing: '0.025em',
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
            position: 'relative',
            overflow: 'hidden',
              }}
              onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(59, 130, 246, 0.5)';
            e.currentTarget.style.background =
              'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
              }}
              onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(59, 130, 246, 0.39)';
            e.currentTarget.style.background =
              'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
              }}
              onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
              >
            <span style={{ fontSize: '18px' }}>🏪</span>
            <span>Merchant Registration</span>
              </div>
            </button>
          )}

          {/* Public Registration Button */}
          {eventByIdQuery.data.content.allow_public === 1 && (
            <button
              onClick={handlePublicRegistration}
              style={{
            flex: 1,
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '15px',
            letterSpacing: '0.025em',
            boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
            position: 'relative',
            overflow: 'hidden',
              }}
              onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(16, 185, 129, 0.5)';
            e.currentTarget.style.background =
              'linear-gradient(135deg, #059669 0%, #047857 100%)';
              }}
              onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(16, 185, 129, 0.39)';
            e.currentTarget.style.background =
              'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              }}
              onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
              >
            <span style={{ fontSize: '18px' }}>👤</span>
            <span>Public Registration</span>
              </div>
            </button>
          )}
            </div>
          </div>
        )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
        {eventByIdQuery.isLoading ? 'Loading event details...' : 'No event data available'}
          </div>
        )}
      </Modal>
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Event;
