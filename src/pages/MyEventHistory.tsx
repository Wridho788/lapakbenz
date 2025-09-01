import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import './AccountPages.css';

const MyEventHistory: React.FC = () => {
  const navigate = useNavigate();

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
  
  const events = [
    {
      id: '1',
      name: 'Workshop UI/UX Design',
      date: '2024-08-15',
      chapter: 'MBW202.05',
      status: 'Completed'
    },
    {
      id: '2',
      name: 'Tech Career Talk',
      date: '2024-08-10',
      chapter: 'MBW202.04',
      status: 'Completed'
    },
    {
      id: '3',
      name: 'Web Development Bootcamp',
      date: '2024-09-20',
      chapter: 'MBW202.06',
      status: 'Upcoming'
    }
  ];

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
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-info">
                  <h4>{event.name}</h4>
                  <p>{event.chapter}</p>
                  <p>{event.date}</p>
                </div>
                <div className={`event-status ${event.status.toLowerCase()}`}>
                  {event.status}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <img src="/nodata.png" alt="No Data" className="empty-icon" />
              <h3>No Event History</h3>
              <p>You haven't participated in any events yet. Start exploring events to build your history!</p>
            </div>
          )}
        </div>
      </div>
      
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyEventHistory;
