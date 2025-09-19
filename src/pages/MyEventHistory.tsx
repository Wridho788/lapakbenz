import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useEventsByCustomer } from '../api/hooks';
import './AccountPages.css';

interface EventItem {
  id: string;
  chapter_id?: string;
  chapter: string;
  code?: string;
  name: string;
  dates?: string;
  date?: string;
  time?: string;
  desc?: string;
  image?: string;
  fee?: number;
  minimum_participants?: string;
  type?: number;
  type_desc?: string;
  done?: number;
  done_desc?: string;
  status?: string;
}

const MyEventHistory: React.FC = () => {
  const navigate = useNavigate();

  // Fetch events using the new hook
  const {
    data: eventsResponse,
    isLoading: eventsLoading,
    error: eventsError,
  } = useEventsByCustomer({
    limit: 30,
    offset: 0,
  });

  // Log the response to console
  useEffect(() => {
    if (eventsResponse) {
      console.log('🎉 Events by Customer API Response:', eventsResponse);
      if (eventsResponse.content) {
        console.log('📋 Events Data:', eventsResponse.content);
      }
    }
    if (eventsError) {
      console.error('❌ Events API Error:', eventsError);
    }
  }, [eventsResponse, eventsError]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Uncomment below to test empty state
  //   const events: any[] = [];

  // Use API data if available, otherwise fallback to static data
  const events: EventItem[] = eventsResponse?.content?.result || [];

  return (
    <div className="account-page">
      <AppbarDefault
        title="My Event History"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />

      <div className="account-content">
        <div className="account-card">
          <h3>Event Participation History</h3>

          {/* Show loading state */}
          {eventsLoading && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#666',
              }}
            >
              Loading event history...
            </div>
          )}

          {/* Show error state */}
          {eventsError && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#ff6b6b',
              }}
            >
              Error loading events. Please try again.
            </div>
          )}

          {/* Show events data or fallback to static data */}
          {!eventsLoading && !eventsError && events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="event-item" >
                {/* Baris 1: Event Image with Status Overlay */}
                {event.image && (
                  <div className="event-row-1" style={{ 
                    position: 'relative',
                    marginBottom: '16px'
                  }}>
                    <img 
                      src={event.image} 
                      alt={event.name} 
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        display: 'block'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {/* Status Badge in bottom right corner of image */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {event.done_desc || event.status || 'Available'}
                    </div>
                  </div>
                )}
                
                {/* Baris 2: Two Column Layout */}
                <div className="event-row-2" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '20px',
                  padding: '0'
                }}>
                  {/* Column 1 */}
                  <div className="event-column-1">
                    {/* Name */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        color: '#666',
                        marginBottom: '4px'
                      }}>
                        NAME
                      </div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        lineHeight: '1.3'
                      }}>
                        {event.name}
                      </div>
                    </div>
                    
                    {/* Chapter */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        color: '#666',
                        marginBottom: '4px'
                      }}>
                        CHAPTER
                      </div>
                      <div>{event.chapter}</div>
                    </div>
                    
                    {/* Event Code */}
                    {event.code && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          EVENT CODE
                        </div>
                        <div>{event.code}</div>
                      </div>
                    )}
                    
                    {/* Min Participants */}
                    {event.minimum_participants && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          MIN PARTICIPANTS
                        </div>
                        <div>{event.minimum_participants}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Column 2 */}
                  <div className="event-column-2">
                    {/* Date */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        color: '#666',
                        marginBottom: '4px'
                      }}>
                        DATE
                      </div>
                      <div>{event.dates || event.date}</div>
                    </div>
                    
                    {/* Time */}
                    {event.time && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          TIME
                        </div>
                        <div>{event.time}</div>
                      </div>
                    )}
                    
                    {/* Fee */}
                    {event.fee && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          FEE
                        </div>
                        <div style={{ 
                          fontWeight: '600',
                          color: '#e74c3c'
                        }}>
                          Rp {event.fee.toLocaleString()}
                        </div>
                      </div>
                    )}
                    
                    {/* Description */}
                    {event.desc && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          DESCRIPTION
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          lineHeight: '1.4',
                          color: '#555'
                        }}>
                          {event.desc}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            ))
          ) : !eventsLoading && !eventsError ? (
            <div className="empty-state">
              <img src="/nodata.png" alt="No Data" className="empty-icon" />
              <h3>No Event History</h3>
              <p>
                You haven't participated in any events yet. Start exploring events to build your
                history!
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyEventHistory;
