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

interface ArticleItem {
  id: string;
  title: string;
  text: string;
  image: string;
  created_at: string;
}

interface RegistrationData {
  transid: number;
  ordercode: string;
  invoice_url: string;
}

const tabs = ['Akan Datang', 'Selesai', 'Berita'];

const Event: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  
  // State untuk akumulasi data (infinite scroll)
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [allArticles, setAllArticles] = useState<ArticleItem[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 60;
  const PULL_DAMPING = 0.4; // Resistance effect
  const observerRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);
  
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuthStore();
  
  // API hooks
  const eventMutation = usePostEvent();
  const articleMutation = usePostArticle();
  const eventRegisterMutation = useEventRegister();
  
  // Only call useEventById when modal is open and eventId is selected
  const eventByIdQuery = useEventById(modalOpen && selectedEventId ? selectedEventId : '');

  // Cleanup touch events on unmount
  useEffect(() => {
    return () => {
      pulling.current = false;
      startY.current = null;
      setPullDistance(0);
    };
  }, []);

  // Reset data ketika tab atau chapter berubah
  useEffect(() => {
    setAllEvents([]);
    setAllArticles([]);
    setHasMoreData(true);
    setIsLoadingMore(false);
  }, [activeTab, selectedChapters]);

  // Akumulasi data dari API response untuk events
  useEffect(() => {
    if (eventMutation.data?.content?.result) {
      const newEvents = eventMutation.data.content.result;
      
      if (eventMutation.variables?.offset === 0) {
        // Initial load atau refresh
        setAllEvents(newEvents);
      } else {
        // Infinite scroll - append data
        setAllEvents(prev => {
          // Prevent duplicates
          const existingIds = new Set(prev.map(e => e.id));
          const uniqueNewEvents = newEvents.filter((e: EventItem) => !existingIds.has(e.id));
          return [...prev, ...uniqueNewEvents];
        });
      }
      
      // Check if there's more data
      if (newEvents.length < 10) {
        setHasMoreData(false);
      }
      setIsLoadingMore(false);
    }
  }, [eventMutation.data]);

  // Akumulasi data dari API response untuk articles
  useEffect(() => {
    if (articleMutation.data?.content?.result) {
      const newArticles = articleMutation.data.content.result;
      
      if (articleMutation.variables?.offset === 0 || !articleMutation.variables?.offset) {
        // Initial load atau refresh
        setAllArticles(newArticles);
      } else {
        // Infinite scroll - append data
        setAllArticles(prev => {
          // Prevent duplicates
          const existingIds = new Set(prev.map(a => a.id));
          const uniqueNewArticles = newArticles.filter((a: ArticleItem) => !existingIds.has(a.id));
          return [...prev, ...uniqueNewArticles];
        });
      }
      
      // Check if there's more data
      if (newArticles.length < 10) {
        setHasMoreData(false);
      }
      setIsLoadingMore(false);
    }
  }, [articleMutation.data]);

  // IntersectionObserver untuk deteksi scroll sampai akhir event list
  useEffect(() => {
    const currentObserverTarget = observerRef.current;
    if (!currentObserverTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreData && !isLoadingMore && !refreshing) {
          console.log('📽 User has scrolled to the end of the list!');
          setIsLoadingMore(true);
          
          if (activeTab === 0 || activeTab === 1) {
            // Infinite scroll event
            const chapterParam = selectedChapters.length > 0 ? selectedChapters.join(',') : '';
            const offset = allEvents.length;
            const payload = activeTab === 0
              ? { status: '0', limit: 10, offset, chapter: chapterParam }
              : { status: '1', limit: 10, offset, chapter: chapterParam };
            eventMutation.mutate(payload);
          } else if (activeTab === 2) {
            // Infinite scroll article
            const offset = allArticles.length;
            articleMutation.mutate({ limit: 10, offset });
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(currentObserverTarget);

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [
    activeTab, 
    selectedChapters, 
    allEvents.length, 
    allArticles.length, 
    hasMoreData, 
    isLoadingMore,
    refreshing
  ]);

  // Pull to refresh handlers dengan damping effect
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || startY.current === null || refreshing) return;
    
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      e.preventDefault();
      // Apply damping for natural feel
      const dampedDistance = diff * PULL_DAMPING;
      setPullDistance(Math.min(dampedDistance, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > PULL_THRESHOLD * PULL_DAMPING) {
      triggerRefresh();
    }
    pulling.current = false;
    startY.current = null;
    setTimeout(() => setPullDistance(0), 150);
  };

  const triggerRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setHasMoreData(true);
    
    try {
      if (activeTab === 0 || activeTab === 1) {
        const chapterParam = selectedChapters.length > 0 ? selectedChapters.join(',') : '';
        const payload =
          activeTab === 0
            ? { status: '0', limit: 10, offset: 0, chapter: chapterParam }
            : { status: '1', limit: 10, offset: 0, chapter: chapterParam };
        await eventMutation.mutateAsync(payload);
      } else if (activeTab === 2) {
        await articleMutation.mutateAsync({ limit: 10, offset: 0 });
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, eventMutation, articleMutation, selectedChapters, refreshing]);

  // Fetch data on mount and tab change or chapter selection change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    
    if (activeTab === 0 || activeTab === 1) {
      // Fetch events for upcoming/completed
      const chapterParam = selectedChapters.length > 0 ? selectedChapters.join(',') : '';
      const payload =
        activeTab === 0
          ? { status: '0', limit: 10, offset: 0, chapter: chapterParam }
          : { status: '1', limit: 10, offset: 0, chapter: chapterParam };
      eventMutation.mutate(payload);
    } else if (activeTab === 2) {
      // Fetch articles for news
      articleMutation.mutate({ limit: 10, offset: 0 });
    }
  }, [activeTab, selectedChapters]);

  // Handle chapter selection change
  const handleChapterSelectionChange = (newSelectedChapters: string[]) => {
    setSelectedChapters(newSelectedChapters);
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
    setRegistrationData(null);
  };

  // Helper function to ensure URL has https protocol
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
        const errorMsg = result.message || result.error || 'Registration failed. Please try again.';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Event Registration Failed:', error);
      
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message ||
        error.message || 
        'Event registration failed. Please try again.';
      
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage,
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
      // News data from accumulated articles
      return allArticles;
    } else {
      // Event data from accumulated events
      if (activeTab === 0) {
        // Upcoming: done = 0
        return allEvents.filter((event) => event.done === 0);
      } else {
        // Completed: done = 1
        return allEvents.filter((event) => event.done === 1);
      }
    }
  };

  const isLoading = () => {
    if (activeTab === 2) {
      return (articleMutation.isPending && allArticles.length === 0) || refreshing;
    } else {
      return (eventMutation.isPending && allEvents.length === 0) || refreshing;
    }
  };

  const pullThresholdAdjusted = PULL_THRESHOLD * PULL_DAMPING;

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
        defaultBack="/dashboard" 
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
        {(pullDistance > pullThresholdAdjusted ? 'Lepaskan untuk menyegarkan' : 'Tarik untuk menyegarkan') +
          (refreshing ? ' • menyegarkan...' : '')}
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
            disabled={refreshing}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="event-content">
        <div className="event-list">
          {isLoading() ? (
            <div className="loading-state">
              <p>{refreshing ? 'Menyegarkan...' : 'Memuat...'}</p>
            </div>
          ) : (
            <>
              {getFilteredData().map((item: any) =>
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
              )}
              
              {/* Loading indicator untuk infinite scroll */}
              {isLoadingMore && (
                <div className="loading-more" style={{ padding: '20px', textAlign: 'center' }}>
                  <p>Memuat lagi...</p>
                </div>
              )}
            </>
          )}

          {/* Infinite scroll trigger */}
          {hasMoreData && !isLoading() && <div ref={observerRef} style={{ height: 1 }} />}

          {!isLoading() && getFilteredData().length === 0 && (
            <div className="empty-state">
              <img src="/nodata.png" alt="Tidak Ada Data" className="empty-icon" />
              <h3>Tidak Ada {tabs[activeTab]}</h3>
              <p>Tidak ada {tabs[activeTab].toLowerCase()} saat ini. Silakan cek kembali nanti!</p>
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