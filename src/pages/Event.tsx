import React, { useState } from 'react';
import { EventCard } from '../components/EventCard';
import { useNavigate } from 'react-router-dom';
// import { MdCalendarToday, MdLocationOn, MdPeople } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import './Event.css';
import '../components/FABPositioning.css';

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'completed';
  category: 'event' | 'news';
}

// Dummy data untuk events
const eventsData: EventData[] = [
  {
    id: '1',
    title: 'UI/UX Design Workshop',
    description:
      'Learn the fundamentals of user interface and user experience design. Perfect for beginners looking to start their design journey.',
    date: '2025-08-15',
    time: '10:00',
    location: 'Design Studio Kemang',
    participants: 25,
    maxParticipants: 25,
    status: 'completed',
    category: 'event',
  },
  {
    id: '2',
    title: 'Career Talk: Tech Industry',
    description:
      'Senior professionals share insights about career paths in technology. Q&A session included.',
    date: '2025-08-10',
    time: '19:00',
    location: 'WeWork SCBD',
    participants: 40,
    maxParticipants: 60,
    status: 'completed',
    category: 'event',
  },
];

const newsData: EventData[] = [
  {
    id: 'n1',
    title: 'New Feature: Event Chat Rooms',
    description:
      'We have launched event-specific chat rooms where participants can connect and discuss before, during, and after events. Join the conversation!',
    date: '2025-08-22',
    time: '10:00',
    location: 'Online',
    participants: 0,
    maxParticipants: 0,
    status: 'upcoming',
    category: 'news',
  },
  {
    id: 'n2',
    title: 'Partnership with Tech Companies',
    description:
      'Merciku has partnered with leading technology companies to bring exclusive opportunities, internships, and job placements to our community members.',
    date: '2025-08-20',
    time: '15:30',
    location: 'Online',
    participants: 0,
    maxParticipants: 0,
    status: 'upcoming',
    category: 'news',
  },
  {
    id: 'n3',
    title: 'Mobile App Update v2.1',
    description:
      'Latest app update includes improved navigation, notification system, and better user experience. Update now from your app store!',
    date: '2025-08-18',
    time: '09:00',
    location: 'Online',
    participants: 0,
    maxParticipants: 0,
    status: 'upcoming',
    category: 'news',
  },
];

const tabs = ['Upcoming', 'Completed', 'News'];

const Event: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 0: // Upcoming
        return eventsData.filter((event) => event.status === 'upcoming');
      case 1: // Completed
        return eventsData.filter((event) => event.status === 'completed');
      case 2: // News
        return newsData;
      default:
        return [];
    }
  };

  return (
    <div className="event-page">
      <AppbarDefault title="Events" onBack={handleBackClick} />

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
          {getFilteredData().map((item) =>
            tabs[activeTab] === 'News' ? (
              // <EventCard
              //   key={item.id}
              //   id={parseInt(item.id)}
              //   image="/bea2x.jpg"
              //   title={item.title}
              //   date={`${item.date} - ${item.time}`}
              //   chapter=""
              //   type=""
              //   className="custom-event-card"
              // />
                          <div key={item.id} className="custom-event-card">
              <div className="event-row">
                <div className="event-img-col">
                  <img src="/bea2x.jpg" alt="Event" style={{ maxWidth: '70px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
                <div className="event-info-col">
                  <div className="event-title-row">
                    <h3 className="event-title">SOTRBEABEA2x - BEA2x</h3>
                  </div>
                  <div className="event-date-row">
                    <span className="event-date">19 Jun 2024 - 00-00-00</span>
                  </div>
                </div>
              </div>
            </div>

            ) : (
              <div key={item.id} className="custom-event-card">
                <div className="event-row">
                  <div className="event-img-col">
                    <img
                      src="/bea2x.jpg"
                      alt="Event"
                      style={{
                        maxWidth: '70px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                  <div className="event-info-col">
                    <div className="event-title-row">
                      <h3 className="event-title">SOTRBEABEA2x - BEA2x</h3>
                      <span className="event-chapter">MBW202.05</span>
                    </div>
                    <div className="event-date-row">
                      <span className="event-date">19 Jun 2024 - 00-00-00</span>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}

          {getFilteredData().length === 0 && (
            <div className="empty-state">
              <img src="/nodata.png" alt="No Data" className="empty-icon" />
              <h3>No {tabs[activeTab]}</h3>
              <p>There are no {tabs[activeTab].toLowerCase()} at the moment. Check back later!</p>
            </div>
          )}
        </div>
      </div>
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Event;
